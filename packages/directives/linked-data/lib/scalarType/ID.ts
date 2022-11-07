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

interface Mapper<T> {
  serialize(value: Term): T;
  parseValue(value: T): Term;
}

function scalarMapperFactory<T>(mapper: Mapper<T>) {
  return (scalarName: string) => (schema: GraphQLSchema) =>
    mapSchema(schema, {
      [MapperKind.SCALAR_TYPE]: (fieldConfig) => {
        if (fieldConfig.name === scalarName) {
          // @ts-ignore
          fieldConfig.serialize = mapper.serialize;
          // @ts-ignore
          fieldConfig.parseValue = mapper.parseValue;
        }
        return fieldConfig;
      },
    });
}

function stringHandler<T>(mapper: Mapper<T>) {
  return (scalarName: string) => (schema: GraphQLSchema) =>
    mapSchema(schema, {
      [MapperKind.SCALAR_TYPE]: (fieldConfig) => {
        if (fieldConfig.name === scalarName) {
          // @ts-ignore
          fieldConfig.serialize = mapper.serialize;
          // @ts-ignore
          fieldConfig.parseValue = mapper.parseValue;
        }
        return fieldConfig;
      },
    });
}

// export function URL() {
//   'http://www.w3.org/2001/XMLSchema#anyURI'
// }

export function ID(
  scalarName: string
): (schema: GraphQLSchema) => GraphQLSchema {
  return (schema) =>
    mapSchema(schema, {
      [MapperKind.SCALAR_TYPE]: (fieldConfig) => {
        if (fieldConfig.name === scalarName) {
          // const { serialize, parseValue } = fieldConfig;
          // @ts-ignore
          fieldConfig.serialize = (value: Term) => {
            if (value.termType !== "NamedNode") {
              throw new Error(
                `Error serialising [${value.termType}] [${value.value}]: expected @${scalarName} to be a NamedNode`
              );
            }
            // TODO: Re-enable this once we work out what is causing side effects in the test suite
            // return serialize(value.value);
            return value.value;
          };
          // @ts-ignore
          fieldConfig.parseValue = (value: string) => {
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
