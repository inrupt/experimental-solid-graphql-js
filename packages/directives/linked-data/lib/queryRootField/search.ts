import { MapperKind, mapSchema } from '@graphql-tools/utils';
import { GraphQLFieldConfig, GraphQLSchema } from 'graphql';
import { Source } from '../types';

// TODO: Check the ordering of resolution calls
export function search(directiveName: string): (schema: GraphQLSchema) => GraphQLSchema {
  return schema =>
    mapSchema(schema, {
      [MapperKind.QUERY_ROOT_FIELD]: (fieldConfig: GraphQLFieldConfig<any, any, Source>) => {
        throw new Error('Not Implemented')

        // for (const key in fieldConfig.args) {
        //   const directive = getSingleDirective(schema, fieldConfig.args[key], directiveName);

        //   if (directive) {
        //     // Get this field's original resolver
        //     const resolve = getResolver(fieldConfig);

        //     // Replace the original resolver with a function that *first* replaces the node with the identifier
        //     // and then performs the standard resolution actions
        //     fieldConfig.resolve = function (source: Source, args, context, info) {
        //       // TODO: Apply validation on source
        //       // return resolve({ [info.fieldName]: { __node: args[key] } }, args, context, info);
        //       return resolve({ [info.fieldName]: args[key] }, args, context, info);
        //     }
        //   }  
        // }

        // return fieldConfig;
      },
    })
}
