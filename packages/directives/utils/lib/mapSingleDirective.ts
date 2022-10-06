import { GraphQLFieldConfig, GraphQLFieldResolver, GraphQLSchema } from "graphql";
import { getResolver } from './getResolver';
import { getSingleDirective } from './getSingleDirective';

export type ResolverMap<TSource, TContext, TArgs = any> = (r: GraphQLFieldResolver<TSource, TContext, TArgs>) => GraphQLFieldResolver<TSource, TContext, TArgs>;

export function mapSingleDirective<TSource, TContext, TArgs = any>(
  resolveMap: ResolverMap<TSource, TContext, TArgs>,
  schema: GraphQLSchema,
  node: GraphQLFieldConfig<TSource, TContext, TArgs>,
  directiveName: string,
  pathToDirectivesInExtensions?: string[]
) {
  const directive = getSingleDirective(schema, node, directiveName, pathToDirectivesInExtensions);

  if (directive) {
    // Get this field's original resolver
    const resolve = getResolver<TSource, TContext, TArgs>(node);

    // Replace the original resolver with a function that *first* replaces the node with the identifier
    // and then performs the standard resolution actions
    node.resolve = resolveMap(resolve);
  }

  return node;
}
