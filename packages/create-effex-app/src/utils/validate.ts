import { FileSystem } from '@effect/platform'
import { Effect, Schema } from 'effect'

export class ProjectAlreadyExistsError extends Schema.TaggedError<ProjectAlreadyExistsError>()(
  'ProjectAlreadyExistsError',
  {
    projectName: Schema.String,
  }
) {}

const INVALID_CHARS_REGEX = /[<>:"/\\|?*]/
const VALID_NAME_REGEX = /^[a-z0-9-_]+$/i
const RESERVED_NAMES = ['node_modules', 'dist', 'build', '.git', '.next']

const ProjectNameSchema = Schema.String.pipe(
  Schema.nonEmptyString({ message: () => 'Project name cannot be empty' }),
  Schema.trimmed(),
  Schema.filter(name => !INVALID_CHARS_REGEX.test(name), {
    message: () =>
      'Project name contains invalid characters. Avoid special characters like <>:"/\\|?*',
  }),
  Schema.filter(name => !RESERVED_NAMES.includes(name.toLowerCase()), {
    message: () => 'Project name cannot be a reserved directory name',
  }),
  Schema.filter(name => VALID_NAME_REGEX.test(name), {
    message: () => 'Project name can only contain letters, numbers, hyphens, and underscores',
  })
)

export const validateProjectName = (projectName: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem

    const validatedName = yield* Schema.decodeUnknown(ProjectNameSchema)(projectName)

    const exists = yield* fs.exists(validatedName)
    if (exists) {
      return yield* Effect.fail(new ProjectAlreadyExistsError({ projectName: validatedName }))
    }

    return validatedName
  })
