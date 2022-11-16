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
import type { Types } from "@graphql-codegen/plugin-helpers";
import type { GraphQLSchema } from "graphql";

// Adds the compiled schema to the source document
export function plugin<T = any>(
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: T
): Types.Promisable<Types.PluginOutput> {
  return {
    content: "",
    prepend: [
      `import applySolidDirectives from '@inrupt/experimental-graphql-directives-solid'`,
    ],
    append: [
      `
/** The built schema */
export const schema = applySolidDirectives(baseSchema);
`,
    ],
  };
}

export const addToSchema = /* GraphQL */ `
  # Custom Scalars
  scalar Date
  scalar URL

  directive @property(iri: String!, reverse: Boolean) on FIELD_DEFINITION # Require a singular property
  directive @orderBy(iri: String!) on FIELD_DEFINITION
  directive @is(class: String!) on OBJECT
  directive @identifier on ARGUMENT_DEFINITION | FIELD_DEFINITION
  directive @filter on ARGUMENT_DEFINITION
  directive @webId on FIELD_DEFINITION
`;
