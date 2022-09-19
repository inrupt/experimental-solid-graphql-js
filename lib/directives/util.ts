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
