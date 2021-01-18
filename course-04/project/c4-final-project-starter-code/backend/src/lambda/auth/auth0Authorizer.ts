import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const jwkToPem = require('jwk-to-pem')
const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-sw591yme.eu.auth0.com/.well-known/jwks.json'
let pubKey

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt
  const pubKey = await getPublicKey(jwt.header.kid)

  logger.info('Verifing JWT Token', {jwt, pubKey})

  return verify(token, pubKey, { algorithms: ['RS256'] }) as JwtPayload

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')
  if (!authHeader.toLowerCase().startsWith('bearer ')) throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

async function getPublicKey(kid): Promise<string> {
  if (pubKey)
    return pubKey;

  try {
    const jwks = (await Axios.get(jwksUrl)).data
    pubKey = extractPublicKey(jwks.keys, kid)

    logger.info('Retrieved new Auth0 key:', pubKey)

    return pubKey;

  } catch (error) {
    throw new Error('There was an error retrieving the Auth0 key' + error)
  }
}

function extractPublicKey(jwks, kid) {
  try {
    return jwkToPem(jwks
        .filter(key => key.use === 'sig'
            && key.kty === 'RSA'
            && key.kid
            && key.kid === kid
            && ((key.x5c && key.x5c.length) || (key.n && key.e))
        )[0])
  } catch (error) {
    throw new Error('There was an error extracting the public key from JWKS ' + error)
  }
}