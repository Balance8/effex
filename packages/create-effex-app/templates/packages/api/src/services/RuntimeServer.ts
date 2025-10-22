import { Layer, ManagedRuntime } from 'effect'

import { DatabaseLive } from '@workspace/database/effect-client'

import { UsersService } from './UsersService'

const MainLayer = Layer.mergeAll(
  UsersService.Live
).pipe(Layer.provide(DatabaseLive))

export const RuntimeServer = ManagedRuntime.make(MainLayer)

