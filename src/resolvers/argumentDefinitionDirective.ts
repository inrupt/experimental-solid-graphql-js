import { MapperKind, mapSchema, getArgumentsWithDirectives, getDocumentNodeFromSchema, getDirective, getArgumentValues } from '@graphql-tools/utils';
import { defaultFieldResolver, GraphQLSchema } from 'graphql';
import { DataFactory } from 'n3';
import { queryObject } from './executeContext';
import { FieldConfig } from "./types";
import { getSingleDirective } from './util';

// TODO: Split this across 2 directives

export function identifierDirective(directiveName: string): (schema: GraphQLSchema) => GraphQLSchema {
  return schema =>
    mapSchema(schema, {
      // [MapperKind.ARGUMENT]: (fieldConfig) => {
      //   if (getSingleDirective(schema, fieldConfig, directiveName)) {
      //     // const values = getArgumentValues(fieldConfig);
      //     // console.log(fieldConfig)
      //   }
      //   return fieldConfig;
      // },
      // [MapperKind.OBJECT_FIELD]: (fieldConfig: FieldConfig) => {
      //   if (getSingleDirective(schema, fieldConfig, directiveName)) {
      //     console.log('boo', fieldConfig.args)
      //     const resolve = fieldConfig.resolve || defaultFieldResolver
      //     fieldConfig = {
      //       ...fieldConfig,
      //       resolve(source, args, context, info) {
      //         console.log('resolve called on object field with', args)
      //         return resolve(source, args, context, info)
      //       }
      //     }
      //   }

      //   // console.log('object field', fieldConfig)
        
      //   return fieldConfig;
      //   // if (getSingleDirective(schema, fieldConfig, directiveName)) {
      //   //   // const values = getArgumentValues(fieldConfig);
      //   //   console.log(fieldConfig)
      //   // }
      //   // return fieldConfig;
      // },
      [MapperKind.OBJECT_FIELD]: (fieldConfig: FieldConfig) => {
        const directive = getSingleDirective(schema, fieldConfig, directiveName);

        if (directive) {
          const resolve = fieldConfig.resolve || defaultFieldResolver;
          fieldConfig = {
            ...fieldConfig,
            // TODO: Fix typing here
            async resolve(source: any, args, context, info) {
              source = {
                // TODO: Ensure validation that this is a named node or do some other kind of unique conversion
                [info.fieldName]: source.value
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
      },
      [MapperKind.QUERY_ROOT_FIELD]: (fieldConfig: FieldConfig) => {
        // TODO: Proper type & key checks here
        for (const key in fieldConfig.args) {
          const field = fieldConfig.args[key];
          const fieldDirective = getSingleDirective(schema, field, directiveName)
          if (fieldDirective) {
            fieldConfig = {
              ...fieldConfig,
              resolve(source, args, context, info) {
                // TODO: Proper node resolution here
                return DataFactory.namedNode(args[key]);
              }
            }
          }
        }
        
        
        // console.log('root field called', fieldConfig.args)
        
        
        
        // if (getSingleDirective(schema, fieldConfig, directiveName)) {
        //   console.log('boo', fieldConfig.args)
          // const resolve = fieldConfig.resolve || defaultFieldResolver
          // fieldConfig = {
          //   ...fieldConfig,
          //   resolve(source, args, context, info) {
          //     console.log('resolve called on object field with', args)
          //     return resolve(source, args, context, info)
          //   }
          // }
        // }

        // console.log('object field', fieldConfig)
        
        return fieldConfig;
        // if (getSingleDirective(schema, fieldConfig, directiveName)) {
        //   // const values = getArgumentValues(fieldConfig);
        //   console.log(fieldConfig)
        // }
        // return fieldConfig;
      },
    })
}
