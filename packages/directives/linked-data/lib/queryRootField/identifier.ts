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
import type { GraphQLFieldConfig, GraphQLSchema } from "graphql";
import type { Source } from "../types";

// TODO: Check the ordering of resolution calls
export function identifier(
  directiveName: string
): (schema: GraphQLSchema) => GraphQLSchema {
  return (schema) =>
    mapSchema(schema, {
      [MapperKind.QUERY_ROOT_FIELD]: (
        fieldConfig: GraphQLFieldConfig<any, any, Source>
      ) => {
        const fieldConfigsArgs = fieldConfig.args;

        if (fieldConfigsArgs) {
          for (const key of Object.keys(fieldConfigsArgs)) {
            const directive = getSingleDirective(
              schema,
              fieldConfigsArgs[key],
              directiveName
            );

            if (directive) {
              // Get this field's original resolver
              const resolve = getResolver(fieldConfig);

              // Replace the original resolver with a function that *first* replaces the node with the identifier
              // and then performs the standard resolution actions
              fieldConfig.resolve = function res(
                source: Source,
                args,
                context,
                info
              ): any {
                // TODO: Apply validation on source
                // return resolve({ [info.fieldName]: { __node: args[key] } }, args, context, info);
                return resolve(
                  { [info.fieldName]: args[key] },
                  args,
                  context,
                  info
                );
              };
            }
          }
        }

        return fieldConfig;
      },
    });
}
