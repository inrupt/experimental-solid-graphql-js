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
import { queryObject } from "@inrupt/sparql-utils";
import {
  GraphQLFieldConfig,
  GraphQLSchema,
  isListType,
  isNonNullType,
} from "graphql";
import { fromRdf } from "rdf-literal";
import { Source } from "../types";
import { nodeFromDirective } from "../utils";

/* @experimental */
export function orderBy(
  directiveName: string
): (schema: GraphQLSchema) => GraphQLSchema {
  return (schema) =>
    mapSchema(schema, {
      [MapperKind.OBJECT_FIELD]: (
        fieldConfig: GraphQLFieldConfig<any, any, Source>
      ) => {
        const directive = getSingleDirective(
          schema,
          fieldConfig,
          directiveName
        );

        if (directive) {
          // Get this field's original resolver
          const resolve = getResolver(fieldConfig);

          if (
            !isListType(
              isNonNullType(fieldConfig.type)
                ? fieldConfig.type.ofType
                : fieldConfig.type
            )
          ) {
            throw new Error(
              `@${directiveName} can only be applied to list types`
            );
          }

          const node = nodeFromDirective(directive, directiveName);

          fieldConfig.resolve = async (source, args, context, info) => {
            const list = await resolve(source, args, context, info);
            if (!Array.isArray(list)) {
              throw new Error(
                `Order by expects array of elements, received ${typeof list}`
              );
            }

            // TODO: Fix this logic
            const orderings = await Promise.all(
              list.map((elem) =>
                queryObject(context, elem, node).then((e) => {
                  if (e.termType === "Literal") {
                    return { term: elem, ordering: fromRdf(e) };
                  }
                  return { term: elem, ordering: e.value };
                })
              )
            );

            return orderings
              .sort((a, b) =>
                // eslint-disable-next-line no-nested-ternary
                a.ordering === b.ordering ? 0 : a.ordering > b.ordering ? 1 : -1
              )
              .map((e) => e.term);
          };
        }

        return fieldConfig;
      },
    });
}
