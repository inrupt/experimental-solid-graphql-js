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
import type { Term } from "@rdfjs/types";
import type { GraphQLSchema } from "graphql";
import { DataFactory as DF } from "n3";
import { asTerm } from "./asTerm";

export function ID(
  scalarName: string
): (schema: GraphQLSchema) => GraphQLSchema {
  return (schema) =>
    mapSchema(schema, {
      [MapperKind.SCALAR_TYPE]: (fieldConfig) => {
        if (fieldConfig.name === scalarName) {
          fieldConfig.serialize = (anyValue: unknown): string => {
            const value = asTerm(anyValue);
            if (value.termType !== "NamedNode") {
              throw new Error(
                `Error serialising [${value.termType}] [${value.value}]: expected @${scalarName} to be a NamedNode`
              );
            }
            // TODO: Re-enable this once we work out what is causing side effects in the test suite
            // return serialize(value.value);
            return value.value;
          };
          fieldConfig.parseValue = (value: unknown): Term => {
            if (typeof value !== "string") {
              throw new Error(
                `Expected string, received ${value} of type ${typeof value}`
              );
            }
            return DF.namedNode(value);
            // TODO: Re-enable this once we work out what is causing side effects in the test suite
            // return parseValue(DF.namedNode(value));
          };
        }
        return fieldConfig;
      },
    });
}
