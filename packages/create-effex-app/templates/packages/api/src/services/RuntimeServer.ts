import { Layer, ManagedRuntime } from 'effect'

import { DatabaseLive } from '@workspace/database/effect/client'

import { PostsService } from './PostsService'
import { UsersService } from './UsersService'

const MainLayer = Layer.mergeAll(
  UsersService.Live,
  PostsService.Live
).pipe(Layer.provide(DatabaseLive))

export const RuntimeServer = ManagedRuntime.make(MainLayer)

