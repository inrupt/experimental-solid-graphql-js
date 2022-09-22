import { mapSchema, MapperKind } from '@graphql-tools/utils';
import { GraphQLSchema } from 'graphql';
import { fromRdf, TypeHandlerDate } from 'rdf-literal';
import { FieldConfig } from '../../types';
import { getSingleDirective, getResolverFromConfig } from '../util';

// const dateHandler = new TypeHandlerDate();
// dateHandler.fromRdf

export function coerceXSDDatesDirective(directiveName: string): (schema: GraphQLSchema) => GraphQLSchema {
  return schema =>
    mapSchema(schema, {
      [MapperKind.SCALAR_TYPE]: (fieldConfig) => {
        const directive = getSingleDirective(schema, fieldConfig, directiveName);
        const dateHandler = new TypeHandlerDate();

        if (directive) {
          const serialize = fieldConfig.serialize
          fieldConfig.serialize = (term) => {
            return serialize(dateHandler.fromRdf(term.__node, true));
          }
        }


        // const parseLiteral = fieldConfig.parseLiteral
        // fieldConfig.parseLiteral = (...args) => {
        //   console.log('parse literal called with', ...args);
        //   return parseLiteral(...args);
        // }

        // const parseValue = fieldConfig.parseValue
        // fieldConfig.parseValue = (...args) => {
        //   console.log('parse value called with', ...args);
        //   return parseValue(...args);
        // }

        // const serialize = fieldConfig.serialize
        // fieldConfig.serialize = (...args) => {
        //   console.log('serialize called with', ...args);
        //   return serialize(...args);
        // }
        
        
        // fieldConfig.parseLiteral
        
        
        // console.log(fieldConfig.parseLiteral);
        return fieldConfig;
        
        
        // const directive = getSingleDirective(schema, fieldConfig, directiveName);

        // if (directive) {
        //   // Get this field's original resolver
        //   const resolve = getResolverFromConfig(fieldConfig);

        //   fieldConfig.resolve = async function (source, args, context, info) {
        //     const data = await resolve(source, args, context, info);
        //     return fromRdf(data.__node, true);
        //   }
        // }

        // return fieldConfig;
      }
    })
}
