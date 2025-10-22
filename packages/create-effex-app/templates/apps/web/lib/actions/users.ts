'use server'

import { Effect, Match } from 'effect'
import { revalidatePath } from 'next/cache'

import { RuntimeServer, UsersService } from '@workspace/api'
import type { InsertUser } from '@workspace/database/effect/schemas/user-schemas'

const logError = (operation: string, error: unknown) => {
  console.error(`${operation} error:`, error)
}

export async function getAllUsersAction() {
  const program = Effect.gen(function* () {
    const usersService = yield* UsersService
    const users = yield* usersService.getAllUsers
    return users
  })

  return await RuntimeServer.runPromise(
    program.pipe(
      Effect.match({
        onFailure: error => {
          logError('Get all users', error)
          return {
            success: false as const,
            error: 'Failed to get users',
          }
        },
        onSuccess: users => ({
          success: true as const,
          data: users,
        }),
      })
    )
  )
}

export async function getUserByIdAction(id: string) {
  const program = Effect.gen(function* () {
    const usersService = yield* UsersService
    const user = yield* usersService.getUserById(id)
    return user
  })

  return await RuntimeServer.runPromise(
    program.pipe(
      Effect.match({
        onFailure: Match.valueTags({
          UserNotFound: () => ({
            success: false as const,
            error: 'User not found',
          }),
          DatabaseError: error => {
            logError('Get user by ID', error)
            return {
              success: false as const,
              error: 'Failed to get user',
            }
          },
          ParseError: error => {
            logError('Get user by ID', error)
            return {
              success: false as const,
              error: 'Failed to parse user data',
            }
          },
        }),
        onSuccess: user => ({
          success: true as const,
          data: user,
        }),
      })
    )
  )
}

export async function createUserAction(data: InsertUser) {
  const program = Effect.gen(function* () {
    const usersService = yield* UsersService
    const newUser = yield* usersService.createUser(data)
    return newUser
  })

  return await RuntimeServer.runPromise(
    program.pipe(
      Effect.match({
        onFailure: Match.valueTags({
          DatabaseError: error => {
            logError('Create user', error)
            return {
              success: false as const,
              error: 'Failed to create user',
            }
          },
          ParseError: error => {
            logError('Create user', error)
            return {
              success: false as const,
              error: 'Failed to parse user data',
            }
          },
        }),
        onSuccess: newUser => {
          revalidatePath('/users')
          return {
            success: true as const,
            data: newUser,
          }
        },
      })
    )
  )
}

export async function updateUserAction(id: string, data: Partial<InsertUser>) {
  const program = Effect.gen(function* () {
    const usersService = yield* UsersService
    const updatedUser = yield* usersService.updateUser(id, data)
    return updatedUser
  })

  return await RuntimeServer.runPromise(
    program.pipe(
      Effect.match({
        onFailure: Match.valueTags({
          UserNotFound: () => ({
            success: false as const,
            error: 'User not found',
          }),
          DatabaseError: error => {
            logError('Update user', error)
            return {
              success: false as const,
              error: 'Failed to update user',
            }
          },
          ParseError: error => {
            logError('Update user', error)
            return {
              success: false as const,
              error: 'Failed to parse user data',
            }
          },
        }),
        onSuccess: updatedUser => {
          revalidatePath('/users')
          revalidatePath(`/users/${updatedUser.id}`)
          return {
            success: true as const,
            data: updatedUser,
          }
        },
      })
    )
  )
}

export async function deleteUserAction(id: string) {
  const program = Effect.gen(function* () {
    const usersService = yield* UsersService
    const deletedUser = yield* usersService.deleteUser(id)
    return deletedUser
  })

  return await RuntimeServer.runPromise(
    program.pipe(
      Effect.match({
        onFailure: Match.valueTags({
          UserNotFound: () => ({
            success: false as const,
            error: 'User not found',
          }),
          DatabaseError: error => {
            logError('Delete user', error)
            return {
              success: false as const,
              error: 'Failed to delete user',
            }
          },
          ParseError: error => {
            logError('Delete user', error)
            return {
              success: false as const,
              error: 'Failed to parse user data',
            }
          },
        }),
        onSuccess: deletedUser => {
          revalidatePath('/users')
          return {
            success: true as const,
            data: deletedUser,
          }
        },
      })
    )
  )
}

