import { MapperKind, mapSchema } from '@graphql-tools/utils';
import { getResolver, getSingleDirective } from '@inrupt/graphql-directives-utils';
import { GraphQLSchema } from 'graphql';
import { isType } from '@inrupt/sparql-utils';
import { DataFactory as DF } from 'n3';
import type { Term } from '@rdfjs/types';

// TODO: Check the ordering of resolution calls
export function is(directiveName: string): (schema: GraphQLSchema) => GraphQLSchema {
  return schema =>
    mapSchema(schema, {
      [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
        const typeName = (fieldConfig.type as any)?.ofType?.['name'] as string | undefined;

        if (typeName) {
          const directive = getSingleDirective(schema, schema.getType(typeName)!, directiveName);
          if (directive) {
            const c = directive.class;
            const resolve = getResolver(fieldConfig);
            fieldConfig.resolve = async (...args) => {
              const resolved = resolve(...args) as Promise<Term> | Term;
              if (await isType(args[2], resolved, DF.namedNode(c))) {
                return resolved;
              }
              throw new Error(`Expected ${(await resolved).value} to be of type ${c}`)
            }
          }
        }

        return fieldConfig;
      },
    })
}
