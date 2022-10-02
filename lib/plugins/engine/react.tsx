import { CodegenPlugin, PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { GraphQLSchema } from 'graphql';


// Scalars quickstart https://www.the-guild.dev/graphql/scalars/docs/quick-start

const engine = /* ts */ `
ts
`

export function plugin<T = any>(schema: GraphQLSchema, documents: Types.DocumentFile[], config: T): Types.Promisable<Types.PluginOutput> {
  return '';
}
