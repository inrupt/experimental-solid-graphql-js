import { MapperKind, mapSchema, getArgumentsWithDirectives, getDocumentNodeFromSchema, getDirective, getArgumentValues } from '@graphql-tools/utils';
import { defaultFieldResolver, GraphQLSchema } from 'graphql';
import { DataFactory } from 'n3';
import { queryObject } from '../sparql';
import { FieldConfig } from "../types";
import { getSingleDirective, getResolverFromConfig } from './util';

// TODO: Check the ordering of resolution calls
export function identifierQueryRootFieldDirective(directiveName: string): (schema: GraphQLSchema) => GraphQLSchema {
  return schema =>
    mapSchema(schema, {
      [MapperKind.QUERY_ROOT_FIELD]: (fieldConfig: FieldConfig) => {

        for (const key in fieldConfig.args) {
          const directive = getSingleDirective(schema, fieldConfig.args[key], directiveName);

          if (directive) {
            // Get this field's original resolver
            const resolve = getResolverFromConfig(fieldConfig);

            // Replace the original resolver with a function that *first* replaces the node with the identifier
            // and then performs the standard resolution actions
            fieldConfig.resolve = async function (source, args, context, info) {
              // TODO: Apply validation on source
              return resolve({ [info.fieldName]: { __node: DataFactory.namedNode(args[key]) } }, args, context, info);
            }
          }  
        }

        return fieldConfig;
      },
    })
}
