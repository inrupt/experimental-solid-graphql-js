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
import { GraphQLObjectType, GraphQLSchema, Kind } from "graphql";

import { makeDirectiveNode } from "@graphql-tools/utils";

const i = new GraphQLObjectType({
  name: "Test",
  fields: {
    hi: {
      type: new GraphQLObjectType({
        name: "test2",
        fields: {},
      }),
      description: "this is a description",
      extensions: {
        myNode: makeDirectiveNode("myNode", {}),
      },
      astNode: {
        // kind: Kind.FIELD_DEFINITION,
        // name: {
        //   kind: Kind.NAME,
        //   value: 'test2'
        // },
        // type: {
        //   readonly kind: Kind.NAMED_TYPE;
        //   readonly loc?: Location;
        //   readonly name: NameNode;
        // },

        directives: [
          createDirective("is", { class: "http://example.org#test" }),
        ],
      } as any,
    },
  },
  description: "Hello this is a description",
});

const schema = new GraphQLSchema({
  types: [i],
});

// let data = buildSchema(`
// directive @is(iri: String!) on OBJECT
// directive @property(iri: String!) on FIELD_DEFINITION

// "Hello this is a description"
// type Person @is(iri: "http://example.org#Person") {
//   "this is another description"
//   name: String! @property(iri: "http://example.org#name")
// }
// `)

// import { Kind } from 'graphql';

function createDirective(directiveName: string, args: Record<string, string>) {
  const arg = Object.entries(args).map(([key, value]) => {
    return {
      kind: Kind.ARGUMENT,
      name: {
        kind: Kind.NAME,
        value: key,
      },
      value: {
        kind: Kind.STRING,
        value,
      },
    };
  });

  return {
    kind: Kind.DIRECTIVE,
    name: {
      kind: Kind.NAME,
      value: directiveName,
    },
    arguments: arg,
  };
}

// data = mapSchema(data, {
//   [MapperKind.OBJECT_TYPE]: (type, ...args) => {
//     const property = new GraphQLDirective({
//       name: 'property',
//       locations: []
//     })
//     // console.log(type);
//     type.astNode = {
//       // directives: [createDirective('is', { class: 'http://example.org#test' })]
//       directives: [ property ]
//     } as any;
//     // console.log(getDirective(schema, args[1], 'is'))
//     return type
//   },
//   [MapperKind.OBJECT_FIELD]: (type, ...args) => {
//     // (type.astNode ??= astFromField(type, schema)) ?? = []
//     // const currentDirectives = type.astNode?.directives[0].arguments;
//     // const name = type.astNode?.name;
//     // console.log(type.astNode?.directives?.length);
//     const property = new GraphQLDirective({
//       name: 'property',
//       locations: []
//     })

//     type.astNode = {
//       // directives: [createDirective('property', { iri: 'http://example.org#test' })]
//       directives: [ property ]
//     } as any;
//     // console.log(getDirective(schema, args[1], 'is'))
//     return type
//   }
// })

// schema = mapSchema(schema, {
//   // [MapperKind.OBJECT_TYPE]: (type, ...args) => {
//   //   console.log(type);
//   //   // console.log(getDirective(schema, args[1], 'is'))
//   //   return type
//   // }
//   [MapperKind.OBJECT_FIELD]: (type, ...args) => {
//     // (type.astNode ??= astFromField(type, schema)) ?? = []

//     console.log(type.astNode);
//     // console.log(getDirective(schema, args[1], 'is'))
//     return type
//   }
// })
// console.log(printSchemaWithDirectives(scehema));

// console.log(data.getDirective('is')?.astNode?.locations[0].loc?.startToken)

process.exit();

// console.log(data.getType('Person')?.toJSON());

// data = makeExecutableSchema({
//   typeDefs: data,
//   schemaExtensions: [
//   makeDirectiveNode('is', {})
//   ]
// // })

// console.log('extendsings', Object.entries(extractExtensionsFromSchema(data).types['Person']['extensions']))
// console.log(printSchemaWithDirectives(data))
// console.log('-'.repeat(40))
// console.log(printSchemaWithDirectives(schema))
