import { MapperKind, mapSchema } from '@graphql-tools/utils';
import { defaultFieldResolver, GraphQLSchema } from 'graphql';
import { DataFactory } from 'n3';
import { FieldConfig } from "../types";
import { getResolverFromConfig, getSingleDirective } from './util';
import { fromRdf, toRdf } from 'rdf-literal';

export function coerceLiteralDirective(directiveName: string): (schema: GraphQLSchema) => GraphQLSchema {
  return schema =>
    mapSchema(schema, {
      [MapperKind.OBJECT_FIELD]: (fieldConfig: FieldConfig) => {
        const directive = getSingleDirective(schema, fieldConfig, directiveName);

        if (directive) {
          // Get this field's original resolver
          const resolve = getResolverFromConfig(fieldConfig);

          fieldConfig.resolve = async function (source, args, context, info) {
            const data = await resolve(source, args, context, info);
            console.log('a. ',data);
            const r = fromRdf(data.__node);
            console.log('b. ', r)
            return r;
          }
        }

        return fieldConfig;
      }
    })
}
