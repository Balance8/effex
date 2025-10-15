import { Effect } from 'effect'

export class ASTError {
  readonly _tag = 'ASTError' as const
  readonly message: string

  constructor(message: string) {
    this.message = message
  }
}

export const getModels = (ast: unknown) =>
  Effect.try({
    try: () => {
      // biome-ignore lint/suspicious/noExplicitAny: Dynamic AST structure
      const models = (ast as any).list.filter((item: any) => item.type === 'model')
      return models
    },
    catch: (error: unknown) =>
      new ASTError(error instanceof Error ? error.message : 'Failed to extract models'),
  })

export const getEnums = (ast: unknown) =>
  Effect.try({
    try: () => {
      // biome-ignore lint/suspicious/noExplicitAny: Dynamic AST structure
      const enums = (ast as any).list.filter((item: any) => item.type === 'enum')
      return enums
    },
    catch: (error: unknown) =>
      new ASTError(error instanceof Error ? error.message : 'Failed to extract enums'),
  })

export const getDatasource = (ast: unknown) =>
  Effect.try({
    try: () => {
      // biome-ignore lint/suspicious/noExplicitAny: Dynamic AST structure
      const datasource = (ast as any).list.find((item: any) => item.type === 'datasource')
      return datasource
    },
    catch: (error: unknown) =>
      new ASTError(error instanceof Error ? error.message : 'Failed to extract datasource'),
  })

export const getGenerators = (ast: unknown) =>
  Effect.try({
    try: () => {
      // biome-ignore lint/suspicious/noExplicitAny: Dynamic AST structure
      const generators = (ast as any).list.filter((item: any) => item.type === 'generator')
      return generators
    },
    catch: (error: unknown) =>
      new ASTError(error instanceof Error ? error.message : 'Failed to extract generators'),
  })

export const getModelByName = (ast: unknown, modelName: string) =>
  Effect.try({
    try: () => {
      // biome-ignore lint/suspicious/noExplicitAny: Dynamic AST structure
      const model = (ast as any).list.find(
        // biome-ignore lint/suspicious/noExplicitAny: Dynamic AST structure
        (item: any) => item.type === 'model' && item.name === modelName
      )
      return model
    },
    catch: (error: unknown) =>
      new ASTError(error instanceof Error ? error.message : `Failed to find model ${modelName}`),
  })

// biome-ignore lint/suspicious/noExplicitAny: Dynamic AST structure and visitor pattern
export const traverseAST = (ast: unknown, visitor: (node: any) => any) =>
  Effect.gen(function* (_) {
    // biome-ignore lint/suspicious/noExplicitAny: Dynamic AST structure
    for (const item of (ast as any).list) {
      yield* _(visitor(item))
    }
  })

export const validateRelations = (ast: unknown) =>
  Effect.gen(function* (_) {
    const models = yield* _(getModels(ast))
    // biome-ignore lint/suspicious/noExplicitAny: Dynamic model structure
    const modelNames = new Set(models.map((m: any) => m.name))

    const errors: string[] = []

    for (const model of models) {
      if (model.properties) {
        for (const field of model.properties) {
          if (field.type === 'field' && field.attributes) {
            for (const attr of field.attributes) {
              if (attr.name === 'relation') {
                const relatedType = field.fieldType
                if (relatedType && !modelNames.has(relatedType)) {
                  errors.push(
                    `Model ${model.name}: field ${field.name} references unknown model ${relatedType}`
                  )
                }
              }
            }
          }
        }
      }
    }

    if (errors.length > 0) {
      return yield* _(
        Effect.fail(new ASTError(`Relation validation failed:\n${errors.join('\n')}`))
      )
    }

    return errors
  })
