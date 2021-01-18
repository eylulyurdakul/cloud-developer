// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'v5q1e83oq5'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-sw591yme.eu.auth0.com',            // Auth0 domain
  clientId: 'A2R8mEq6wPpzP6LLO3iw6MXduBOuiIZq',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
