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
import { Term } from "@rdfjs/types";
import { GraphQLSchema } from "graphql";
import { DataFactory as DF } from "n3";

export function url(
  scalarName: string
): (schema: GraphQLSchema) => GraphQLSchema {
  // const dateHandler = new TypeHandlerDate();
  const anyURI = "http://www.w3.org/2001/XMLSchema#anyURI";
  return (schema) =>
    mapSchema(schema, {
      [MapperKind.SCALAR_TYPE]: (fieldConfig) => {
        if (fieldConfig.name === scalarName) {
          // @ts-ignore
          fieldConfig.serialize = (value: Term) => {
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

            if (value.datatype.value !== anyURI) {
              throw new Error(
                `Expected a anyURI type, instead received ${value.datatype.value}`
              );
            }

            const v = value.value;

            if (typeof v !== "string") {
              throw new Error("Expected node to have string value");
            }

            return new URL(v);
          };
          // @ts-ignore
          fieldConfig.parseValue = (value: URL) => {
            if (!(value instanceof URL)) {
              throw new Error(
                `Expected URL, received ${value} of type ${typeof value}`
              );
            }

            return DF.literal(value.href, DF.namedNode(anyURI));
            // TODO: Include parsing directives to specify datatype
            // return dateHandler.toRdf(value, { dataFactory: DF }); // TODO: See if params are needed here (and add tests)
            // TODO: Re-enable this once we work out what is causing side effects in the test suite
            // return parseValue(DF.namedNode(value));
          };
        }
        return fieldConfig;
      },
    });
}
