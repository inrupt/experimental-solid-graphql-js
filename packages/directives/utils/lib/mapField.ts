import { getSingleDirective } from './getSingleDirective';
import { getResolver } from './getResolver';
import { GraphQLField, GraphQLFieldConfig, GraphQLFieldResolver, GraphQLSchema } from "graphql";
import { MapperKind, mapSchema } from '@graphql-tools/utils';
import { DataFactory } from 'n3';
import { mapSingleDirective, ResolverMap } from './mapSingleDirective';

export function mapObjectField<TSource, TContext, TArgs = any>(resolveMap: ResolverMap<TSource, TContext, TArgs>) {
  return (directiveName: string) => (schema: GraphQLSchema) => mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig: GraphQLFieldConfig<TSource, TContext, TArgs>) =>
      mapSingleDirective(resolveMap, schema, fieldConfig, directiveName)
  });
}

export function mapRootField<TSource, TContext, TArgs = any>(resolveMap: ResolverMap<TSource, TContext, TArgs>) {
  return (directiveName: string) => (schema: GraphQLSchema) => mapSchema(schema, {
    [MapperKind.QUERY_ROOT_FIELD]: (fieldConfig: GraphQLFieldConfig<TSource, TContext, TArgs>) =>
      mapSingleDirective(resolveMap, schema, fieldConfig, directiveName)
  });
}
