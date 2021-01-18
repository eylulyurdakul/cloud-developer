import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/TodoAccess'
import { createLogger } from "../utils/logger";
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import {UpdateTodoRequest} from "../requests/UpdateTodoRequest";
import {TodoUpdate} from "../models/TodoUpdate";
const logger = createLogger('todos')

const todoAccess = new TodoAccess()

export async function getAllTodoItemsForUser(userId: string): Promise<TodoItem[]> {
    logger.info('Getting all todo items for user with id:', userId)
    return todoAccess.getAllTodoItemsForUser(userId)
}

export async function createTodoItem(todoItem: CreateTodoRequest, userId: string): Promise<TodoItem> {
    logger.info('Creating new todo: ', {"userId": userId, "todoItem": todoItem})

    const todoId = uuid.v4()

    return await todoAccess.createTodoItem({
        todoId: todoId,
        userId: userId,
        done: false,
        createdAt: new Date().toISOString(),
        ...todoItem
    })
}

 export async function updateTodoItem(updateTodoRequest: UpdateTodoRequest, todoId: string, userId: string): Promise<void> {
     logger.info('Updating todo: ', {"updateTodoRequest": updateTodoRequest, "todoId": todoId, "userId": userId})
     const todoUpdate: TodoUpdate = updateTodoRequest as TodoUpdate
     await todoAccess.updateTodoItem(todoUpdate, todoId, userId)
 }

 export async function deleteTodoItem(todoId: string, userId: string): Promise<void> {
     logger.info('Deleting todo with id: ', todoId)
     await todoAccess.deleteTodoItem(todoId, userId)
     await todoAccess.deleteTodoItemAttachment(todoId)
 }

 export async function createUploadUrl(todoId: string, userId: string): Promise<string> {
     const uploadUrl = await todoAccess.createUploadUrl(todoId)
     const downloadUrl = uploadUrl.split("?")[0]

     logger.info('Created signed url ', {"signedUploadUrl": uploadUrl, "downloadUrl": downloadUrl})

     await todoAccess.updateAttachmentUrl(todoId, userId, downloadUrl)

     return uploadUrl
 }