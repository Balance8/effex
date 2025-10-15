import 'server-only'

import { ManagedRuntime } from 'effect'

import { DatabaseLive } from '@workspace/database/effect/client'

import { UsersService } from './UsersService'

const MainLayer = UsersService.Live

export const RuntimeServer = ManagedRuntime.make(MainLayer.pipe(DatabaseLive))
