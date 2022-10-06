import { MapperKind, mapSchema } from '@graphql-tools/utils';
import {  } from '@graphql-tools/schema';
import { getResolver, getSingleDirective } from '@inrupt/graphql-directives-utils';
import { GraphQLFieldConfig, GraphQLSchema } from 'graphql';
import { DataFactory } from 'n3';
import { Source } from '../types';

// TODO: Check the ordering of resolution calls
export function is(directiveName: string): (schema: GraphQLSchema) => GraphQLSchema {
  return schema =>
    mapSchema(schema, {
      [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
        const typeName = (fieldConfig.type as any)?.ofType?.['name'] as string | undefined;

        if (typeName) {
          const directive = getSingleDirective(schema, schema.getType(typeName)!, directiveName);
          if (directive) {
            const c = directive.class;
            const resolve = getResolver(fieldConfig);
            fieldConfig.resolve = (...args) => {
              console.log('intercepting', args, c)
              return resolve(...args);
            }
          }
        }

        return fieldConfig;
      },
    })
}
