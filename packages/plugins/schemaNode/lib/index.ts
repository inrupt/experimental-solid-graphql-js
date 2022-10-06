import { Types } from '@graphql-codegen/plugin-helpers';
import { GraphQLSchema, printSchema, print } from 'graphql';
import { printSchemaWithDirectives } from '@graphql-tools/utils'

// Adds the compiled schema to the source document
export function plugin<T = any>(schema: GraphQLSchema, documents: Types.DocumentFile[], config: T): Types.Promisable<Types.PluginOutput> {
  return {
    content: '',
    prepend: [
      `import { DocumentNode as DocumentN, buildASTSchema } from 'graphql'`,
      `import { makeExecutableSchema } from '@graphql-tools/schema'`
    ],
    append: [
      `export const _SchemaDocument = \`${printSchemaWithDirectives(schema)}\``,
      // `export const _SchemaDocument = ${JSON.stringify(parse(printSchema(schema)))} as unknown as DocumentN`,
      `/** The original schema with no directives applied */`,
// `export const baseSchema = buildASTSchema(_SchemaDocument)`,
`export const baseSchema = makeExecutableSchema({ typeDefs: _SchemaDocument })`
    ]
  }
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
