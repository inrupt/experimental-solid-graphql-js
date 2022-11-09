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
import { TypeHandlerNumberDouble } from "rdf-literal";
import { asTerm } from "./asTerm";

export function float(
  scalarName: string
): (schema: GraphQLSchema) => GraphQLSchema {
  const doubleHandler = new TypeHandlerNumberDouble();
  return (schema) =>
    mapSchema(schema, {
      [MapperKind.SCALAR_TYPE]: (fieldConfig) => {
        if (fieldConfig.name === scalarName) {
          fieldConfig.serialize = (anyValue: unknown): number => {
            const value = asTerm(anyValue);
            if (value.termType !== "Literal") {
              throw new Error(
                `Expected Literal term, instead received ${value.value} of type ${value.termType}`
              );
            }

            if (value.datatype.termType !== "NamedNode") {
              throw new Error(
                `Expected datatype to be a NamedNode, instead received ${value.datatype.value} of type ${value.datatype.termType}`
              );
            }

            if (!TypeHandlerNumberDouble.TYPES.includes(value.datatype.value)) {
              throw new Error(
                `Expected a string type, instead received ${value.datatype.value}`
              );
            }

            const result = doubleHandler.fromRdf(value, true);

            if (typeof result !== "number") {
              throw new Error(
                `Expected node to have number value, instead received ${result} of type ${typeof result}`
              );
            }

            return result;
          };
          fieldConfig.parseValue = (value: unknown): Term => {
            if (typeof value !== "number") {
              throw new Error(
                `Expected node to have number value, instead received ${value} of type ${typeof value}`
              );
            }

            // TODO: Include parsing directives to specify datatype
            return doubleHandler.toRdf(value, { dataFactory: DF }); // TODO: See if params are needed here (and add tests)
            // TODO: Re-enable this once we work out what is causing side effects in the test suite
            // return parseValue(DF.namedNode(value));
          };
        }
        return fieldConfig;
      },
    });
}
