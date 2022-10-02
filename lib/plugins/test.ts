import { CodegenPlugin, PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { GraphQLSchema } from 'graphql';
import {  } from "@graphql-codegen/plugin-helpers";


export function plugin<T = any>(schema: GraphQLSchema, documents: Types.DocumentFile[], config: T): Types.Promisable<Types.PluginOutput> {
  return 'Hello';
}
