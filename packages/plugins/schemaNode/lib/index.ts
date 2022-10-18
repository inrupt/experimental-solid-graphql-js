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
import { Types } from "@graphql-codegen/plugin-helpers";
import { printSchemaWithDirectives } from "@graphql-tools/utils";
import { GraphQLSchema } from "graphql";

// Adds the compiled schema to the source document
export function plugin<T = any>(
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: T
): Types.Promisable<Types.PluginOutput> {
  return {
    content: "",
    prepend: [
      `import { DocumentNode as DocumentN, buildASTSchema } from 'graphql'`,
      `import { makeExecutableSchema } from '@graphql-tools/schema'`,
    ],
    append: [
      `export const _SchemaDocument = \`${printSchemaWithDirectives(schema)}\``,
      // `export const _SchemaDocument = ${JSON.stringify(parse(printSchema(schema)))} as unknown as DocumentN`,
      `/** The original schema with no directives applied */`,
      // `export const baseSchema = buildASTSchema(_SchemaDocument)`,
      `export const baseSchema = makeExecutableSchema({ typeDefs: _SchemaDocument })`,
    ],
  };
}

// TODO: FIX THIS

// export function plugin<T = any>(schema: GraphQLSchema, documents: Types.DocumentFile[], config: T): Types.Promisable<Types.PluginOutput> {
//   return {
//     content: '',
//     prepend: [
//       `import { DocumentNode as DocumentN, buildASTSchema } from 'graphql'`,
//       `import { makeExecutableSchema } from '@graphql-tools/schema'`
//     ],
//     append: [
//       `export const _SchemaDocument = ${JSON.stringify(schema)} as unknown as DocumentN`,
//       // `export const _SchemaDocument = ${JSON.stringify(parse(printSchema(schema)))} as unknown as DocumentN`,
//       `
// /** The original schema with no directives applied */
// export const baseSchema = buildASTSchema(_SchemaDocument)`
// // `export const baseSchema = makeExecutableSchema({ typeDefs: buildASTSchema(_SchemaDocument) })`
//     ]
//   }
// }

// export function plugin<T = any>(schema: GraphQLSchema, documents: Types.DocumentFile[], config: T): Types.Promisable<Types.PluginOutput> {

//   return {
//     content: '',
//     prepend: [
//       `import { makeExecutableSchema } from '@graphql-tools/schema'`
//     ],
//     append: [
//       `export const _SchemaDocument = ${JSON.stringify(parse(printSchema(schema)))} as unknown as Document`,
//       `
// /** The original schema with no directives applied */
// export const baseSchema = buildSchema(print(_SchemaDocument as any))`
//     ]
//   }
// }
