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
} from "@inrupt/experimental-graphql-directives-utils";
import { queryObject, queryObjects } from "@inrupt/experimental-sparql-utils";
import type { GraphQLFieldConfig, GraphQLSchema } from "graphql";
import { isListType, isNonNullType } from "graphql";
import type { Source } from "../types";
import { nodeFromDirective } from "../utils";

export function property(
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
            isListType(
              isNonNullType(fieldConfig.type)
                ? fieldConfig.type.ofType
                : fieldConfig.type
            )
          ) {
            fieldConfig.resolve = (source, args, context, info) =>
              resolve(
                {
                  // [info.fieldName]: queryObjects(context, source.__node, nodeFromDirective(directive, directiveName))
                  //   .then(nodes => nodes.map(node => ({ __node: node })))
                  // [info.fieldName]: queryObjects(context, source.__node, nodeFromDirective(directive, directiveName))
                  [info.fieldName]: queryObjects(
                    context,
                    source,
                    nodeFromDirective(directive, directiveName)
                  ),
                },
                args,
                context,
                info
              );
          } else {
            // Replace the original resolver with a function that *first* replaces the node with the identifier
            // and then performs the standard resolution actions
            fieldConfig.resolve = (source, args, context, info) =>
              resolve(
                {
                  // [info.fieldName]: {
                  //   __node: queryObject(context, source.__node, nodeFromDirective(directive, directiveName))
                  // }
                  // [info.fieldName]: queryObject(context, source.__node, nodeFromDirective(directive, directiveName))
                  [info.fieldName]: queryObject(
                    context,
                    source,
                    nodeFromDirective(directive, directiveName)
                  ),
                },
                args,
                context,
                info
              );
          }
        }

        return fieldConfig;
      },
    });
}
