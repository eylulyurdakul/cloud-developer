import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import {getUserId} from "../utils";
import {createLogger} from "../../utils/logger";
import {createTodoItem} from "../../businessLogic/todos";

const logger = createLogger('createTodo')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const userId = getUserId(event)
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const item = await createTodoItem(newTodo, userId);

  logger.info('Created new todo:', {userId, item, newTodo})

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      item
    })
  }
  // TODO: Implement creating a new TODO item
}
