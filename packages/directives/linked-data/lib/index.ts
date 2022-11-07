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
import type { GraphQLSchema } from "graphql";

import * as objectField from "./objectField";
import * as queryRootField from "./queryRootField";
import * as scalarType from "./scalarType";
import * as objectType from "./objectType";

export function defaultOrder(prefix = "") {
  return [
    objectField.identifier(`${prefix}identifier`),
    objectField.label(`${prefix}label`),
    objectField.property(`${prefix}property`),
    queryRootField.identifier(`${prefix}identifier`),
    scalarType.ID(`${prefix}ID`),
    scalarType.date(`${prefix}Date`),
    scalarType.int(`${prefix}Int`),
    scalarType.float(`${prefix}Float`),
    scalarType.url(`${prefix}URL`),
    scalarType.string(`${prefix}String`),
    objectType.is(`${prefix}is`),
    // NOTE: This is experimental and unstable
    objectField.orderBy(`${prefix}orderBy`),
  ];
}

export default function linkedDataDirectives(
  schema: GraphQLSchema,
  prefix?: string
): GraphQLSchema {
  for (const fn of defaultOrder(prefix)) {
    schema = fn(schema);
  }
  return schema;
}

export { queryRootField, objectField, scalarType };
