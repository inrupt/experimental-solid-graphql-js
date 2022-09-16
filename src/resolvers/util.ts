import { getDirective, MapperKind, mapSchema, SchemaMapper } from '@graphql-tools/utils';
import { GraphQLSchema, defaultFieldResolver, GraphQLFieldConfig } from 'graphql';

export function getSingleDirective(...args: Parameters<typeof getDirective>) {
  const directives = getDirective(...args);

  if (directives && directives.length > 1) {
    throw new Error(`At most 1 @${args[2]} directive allowed - received ${directives.length}`);
  }

  return directives?.[0];
}

export function getResolverFromConfig(fieldConfig: GraphQLFieldConfig<any, any, {
  [argName: string]: any;
}>) {
  return fieldConfig.resolve || defaultFieldResolver;
}

export function getEngineFromContext(context: any) {

}

// function singularDirectiveFactory<T extends MapperKind>(mapperKind: T, mapper: (directive: Record<string, any> | undefined) => SchemaMapper[T]) {
//   return function directive(directiveName: string): (schema: GraphQLSchema) => GraphQLSchema {
//     return schema => mapSchema(schema, {
//       [mapperKind]: mapper(getSingleDirective(schema, fieldConfig, directiveName))
//     })
//   }
// }
