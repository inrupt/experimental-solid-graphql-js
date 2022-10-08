// A directive to order lists of results

import { MapperKind, mapSchema } from '@graphql-tools/utils';
import { getResolver, getSingleDirective } from "@inrupt/graphql-directives-utils";
import { queryObject } from '@inrupt/sparql-utils';
import { GraphQLFieldConfig, GraphQLSchema, isListType, isNonNullType } from "graphql";
import { Source } from '../types';
import { nodeFromDirective } from '../utils';
import { fromRdf } from 'rdf-literal';

/* @experimental */
export function orderBy(directiveName: string): (schema: GraphQLSchema) => GraphQLSchema {
  return schema =>
    mapSchema(schema, {
      [MapperKind.OBJECT_FIELD]: (fieldConfig: GraphQLFieldConfig<any, any, Source>) => {
          const directive = getSingleDirective(schema, fieldConfig, directiveName);

          if (directive) {
            // Get this field's original resolver
            const resolve = getResolver(fieldConfig);

            if (!isListType(
              isNonNullType(fieldConfig.type) ? fieldConfig.type.ofType : fieldConfig.type
            )) {
              throw new Error(`@${directiveName} can only be applied to list types`);
            }

            const node = nodeFromDirective(directive, directiveName);

            fieldConfig.resolve = async (source, args, context, info) => {
              const list = await resolve(source, args, context, info);
              if (!Array.isArray(list)) {
                throw new Error(`Order by expects array of elements, received ${typeof list}`);
              }

              // TODO: Fix this logic
              const orderings = await Promise.all(
                list.map(elem => queryObject(context, elem, node).then(e => {
                  if (e.termType === 'Literal') {
                    return { term: elem, ordering: fromRdf(e) };
                  }
                  return { term: elem, ordering: e.value };
                }))
              );
              
              return orderings
                .sort((a, b) => a.ordering === b.ordering ? 0 : a.ordering > b.ordering ? 1 : -1)
                .map(e => e.term);
            };
        }

        return fieldConfig;
      }
      })
}

