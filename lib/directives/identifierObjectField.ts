import { MapperKind, mapSchema } from '@graphql-tools/utils';
import { GraphQLSchema } from 'graphql';
import { FieldConfig } from "../types";
import { getResolverFromConfig, getSingleDirective } from './util';

// TODO: Check the ordering of resolution calls
export function identifierObjectFieldDirective(directiveName: string): (schema: GraphQLSchema) => GraphQLSchema {
  return schema =>
    mapSchema(schema, {
      [MapperKind.OBJECT_FIELD]: (fieldConfig: FieldConfig) => {
        const directive = getSingleDirective(schema, fieldConfig, directiveName);

        if (directive) {
          // Get this field's original resolver
          const resolve = getResolverFromConfig(fieldConfig);

          // Replace the original resolver with a function that *first* replaces the node with the identifier
          // and then performs the standard resolution actions
          fieldConfig.resolve = async function (source, args, context, info) {
            return resolve({ ...source, [info.fieldName]: source.__node }, args, context, info);
          }
        }

        return fieldConfig;
      }
    })
}
