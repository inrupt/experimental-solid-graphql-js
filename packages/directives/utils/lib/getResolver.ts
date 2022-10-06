import { defaultFieldResolver, GraphQLFieldConfig } from 'graphql';

export function getResolver<TSource, TContext, TArgs = any, K = unknown>(
  fieldConfig: GraphQLFieldConfig<TSource, TContext, TArgs>
) {
  return fieldConfig.resolve || defaultFieldResolver;
}
