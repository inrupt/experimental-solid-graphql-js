import { Types } from '@graphql-codegen/plugin-helpers';
import { GraphQLSchema, printSchema, parse } from 'graphql';

// TODO: Release as a plugin where relevant directives are
// dependencies

// Adds the compiled schema to the source document
export function plugin<T = any>(schema: GraphQLSchema, documents: Types.DocumentFile[], config: T): Types.Promisable<Types.PluginOutput> {
  
  return {
    content: '',
    prepend: [
      `import { DocumentNode as Document } from 'graphql'`
    ],
    append: [
      `export const _SchemaDocument = ${JSON.stringify(parse(printSchema(schema)))}`,
      `
/** The original schema with no directives applied */
export const baseSchema = buildASTSchema(_SchemaDocument as Document)`
    ]
  }
  
  
  
  
  return `import { buildASTSchema, execute, type ExecutionResult, type GraphQLSchema, type PromiseOrValue } from 'graphql';
  import { TypedDocumentNode } from "@graphql-typed-document-node/core";

/** The schema definition to be used by the client-side engine */
const schema = buildASTSchema(${JSON.stringify(parse(printSchema(schema)))} as any)

schema = directives.labelDirective('label')(schema);
schema = directives.identifierObjectFieldDirective('identifier')(schema);
schema = directives.identifierQueryRootFieldDirective('identifier')(schema);
schema = directives.propertyDirective('property')(schema);
schema = directives.coerceLiteralDirective('coerceLiteral')(schema);
schema = directives.coerceXSDDatesDirective('xsdDate')(schema);
schema = directives.yearsToNowDirective('yearsToNow')(schema);
schema = directives.upperDirectiveTransformer(schema, 'upper');

export { schema };

export interface ISolidQueryOptions<TData, TVariables> {
  document: TypedDocumentNode<TData, TVariables>;
  schema?: GraphQLSchema;
  variables: TVariables;
  context?: IContext;
}

export function solidQuery<TData, TVariables extends Record<string, any>>(options: ISolidQueryOptions<TData, TVariables>): PromiseOrValue<ExecutionResult<TData>> {
  return execute({
    schema: options.schema ?? schema,
    document: options.document,
    variableValues: options.variables,
    contextValue: options.context,
  })
}
`
}

// TODO: Make the schema conversions configurable
