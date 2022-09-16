import { MapperKind, mapSchema } from '@graphql-tools/utils';
import { defaultFieldResolver, GraphQLSchema } from 'graphql';
import { DataFactory } from 'n3';
import { queryObject } from './executeContext';
import { FieldConfig } from "./types";
import { getSingleDirective } from './util';

function nodeFromDirective(directive: Record<string, any> | undefined, directiveName: string) {
  if (!directive) {
    throw new Error(`@${directiveName} requires exactly one argument, received 0`);
  }

  const entries = Object.entries(directive);

  if (entries.length !== 1) {
    throw new Error(`@${directiveName} requires exactly one argument, received ${entries.length}`);
  }

  const [[key, value]] = entries;

  if (typeof value !== 'string') {
    throw new Error(`@${directiveName} accepts only string values, received ${typeof value}`);
  }

  const mapping = {
    iri: DataFactory.namedNode
  }

  if (key in mapping) {
    return mapping[key as 'iri'](value);
  }

  throw new Error(`Expected key to be one of ${Object.keys(mapping).join(', ')}; received ${key}`);
}

export function propertyDirective(directiveName: string): (schema: GraphQLSchema) => GraphQLSchema {
  return schema =>
    mapSchema(schema, {
      [MapperKind.OBJECT_FIELD]: (fieldConfig: FieldConfig) => {
        const directive = getSingleDirective(schema, fieldConfig, directiveName);

        if (directive) {
          // TODO: Work out if we need to use the field config type here

          const resolve = fieldConfig.resolve || defaultFieldResolver;
          fieldConfig = {
            ...fieldConfig,
            async resolve(source, args, context, info) {
              // TODO: Improve type checking on term. Classes should only be NamedNodes or blank nodes for instance
              // return await queryObject(context, source, nodeFromDirective(directive, directiveName))
              
              return resolve(
                // TODO: Handle the list case
                // @ts-ignore
                { [info.fieldName]: await queryObject(context, source, nodeFromDirective(directive, directiveName)) },
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
