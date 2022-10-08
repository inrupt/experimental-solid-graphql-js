import { MapperKind, mapSchema } from '@graphql-tools/utils';
import { getResolver, getSingleDirective } from "@inrupt/graphql-directives-utils";
import { queryObject, queryObjects } from '@inrupt/sparql-utils';
import { GraphQLFieldConfig, GraphQLSchema, isListType, isNonNullType } from "graphql";
import { DataFactory } from "n3";
import { Source } from '../types';
import { nodeFromDirective } from '../utils';

export function property(directiveName: string): (schema: GraphQLSchema) => GraphQLSchema {
  return schema =>
    mapSchema(schema, {
      [MapperKind.OBJECT_FIELD]: (fieldConfig: GraphQLFieldConfig<any, any, Source>) => {
          const directive = getSingleDirective(schema, fieldConfig, directiveName);

          if (directive) {
            // Get this field's original resolver
            const resolve = getResolver(fieldConfig);

            if (isListType(
              isNonNullType(fieldConfig.type) ? fieldConfig.type.ofType : fieldConfig.type
            )) {
              fieldConfig.resolve = (source, args, context, info) => resolve(
                {
                  // [info.fieldName]: queryObjects(context, source.__node, nodeFromDirective(directive, directiveName))
                  //   .then(nodes => nodes.map(node => ({ __node: node })))
                  // [info.fieldName]: queryObjects(context, source.__node, nodeFromDirective(directive, directiveName))
                  [info.fieldName]: queryObjects(context, source, nodeFromDirective(directive, directiveName))
                },
                args, context, info
              );
            } else {

            // Replace the original resolver with a function that *first* replaces the node with the identifier
            // and then performs the standard resolution actions
            fieldConfig.resolve = (source, args, context, info) => resolve(
                {
                  // [info.fieldName]: {
                  //   __node: queryObject(context, source.__node, nodeFromDirective(directive, directiveName))
                  // }
                  // [info.fieldName]: queryObject(context, source.__node, nodeFromDirective(directive, directiveName))
                  [info.fieldName]: queryObject(context, source, nodeFromDirective(directive, directiveName))
                },
                args, context, info
              );
            }
          }

          return fieldConfig;
        }
      })
}
