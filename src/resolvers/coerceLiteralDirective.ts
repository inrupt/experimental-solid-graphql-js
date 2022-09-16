import { MapperKind, mapSchema } from '@graphql-tools/utils';
import { defaultFieldResolver, GraphQLSchema } from 'graphql';
import { DataFactory } from 'n3';
import { queryObject } from './executeContext';
import { FieldConfig } from "./types";
import { getSingleDirective } from './util';

export function coerceLiteralDirective(directiveName: string): (schema: GraphQLSchema) => GraphQLSchema {
  return schema =>
    mapSchema(schema, {
      [MapperKind.OBJECT_FIELD]: (fieldConfig: FieldConfig) => {
        const directive = getSingleDirective(schema, fieldConfig, directiveName);

        if (directive) {
          const resolve = fieldConfig.resolve || defaultFieldResolver;
          fieldConfig = {
            ...fieldConfig,
            // TODO: Fix typing here
            async resolve(source: any, args, context, info) {
              source = {
                ...source,
                // TODO: Improve coercion
                [info.fieldName]: source[info.fieldName].value
              }


              console.log('coerce literal called on', source, info.returnType)
              return resolve(
                source,
                // { [info.fieldName]: await queryObject(context, source, nodeFromDirective(directive, directiveName)) },
                args,
                context,
                info
              )
            }
          }
        }

        return fieldConfig;
      }
    })
}
