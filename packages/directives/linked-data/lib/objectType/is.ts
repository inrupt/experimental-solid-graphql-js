//
// Copyright 2022 Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
import { MapperKind, mapSchema } from "@graphql-tools/utils";
import {
  getResolver,
  getSingleDirective,
} from "@inrupt/graphql-directives-utils";
import type { GraphQLSchema } from "graphql";
import { isType } from "@inrupt/sparql-utils";
import { DataFactory as DF } from "n3";
import type { Term } from "@rdfjs/types";

// TODO: Check the ordering of resolution calls
export function is(
  directiveName: string
): (schema: GraphQLSchema) => GraphQLSchema {
  return (schema) =>
    mapSchema(schema, {
      [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
        const typeName = (fieldConfig.type as any)?.ofType?.name as
          | string
          | undefined;

        if (typeName) {
          const directive = getSingleDirective(
            schema,
            schema.getType(typeName)!,
            directiveName
          );
          if (directive) {
            const c = directive.class;
            const resolve = getResolver(fieldConfig);
            fieldConfig.resolve = async (...args) => {
              const resolved = resolve(...args) as Promise<Term> | Term;
              if (await isType(args[2], resolved, DF.namedNode(c))) {
                return resolved;
              }
              throw new Error(
                `Expected ${(await resolved).value} to be of type ${c}`
              );
            };
          }
        }

        return fieldConfig;
      },
    });
}
