// Based on https://www.the-guild.dev/graphql/codegen/docs/custom-codegen/plugin-structure
// TODO: Remove @graphql-codegen/plugin-helpers dependency when we refactor these
// TODO: Remove graphql dev dependency when we refactor these
import { CodegenPlugin, PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { GraphQLSchema } from 'graphql';

// Scalars quickstart https://www.the-guild.dev/graphql/scalars/docs/quick-start

export function plugin<T = any>(schema: GraphQLSchema, documents: Types.DocumentFile[], config: T): Types.Promisable<Types.PluginOutput> {
  return '';
}

export const addToSchema = /* GraphQL */ `
# The stringified version of an RDF Term - should be able to distinguish between named nodes, blank nodes etc.
scalar ID
`
