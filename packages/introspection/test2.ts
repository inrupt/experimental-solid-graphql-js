import { GraphQLSchema, GraphQLObjectType, print, GraphQLFieldConfig, GraphQLOutputType, GraphQLAbstractType, ConstDirectiveNode, DirectiveNode } from 'graphql';
import { printSchema, buildSchema, GraphQLDirective, Kind } from 'graphql';

import { DirectiveUsage, makeDirectiveNode, printSchemaWithDirectives, makeDirectiveNodes, mapSchema, MapperKind, getDirective } from '@graphql-tools/utils'
import { makeExecutableSchema, extractExtensionsFromSchema,} from '@graphql-tools/schema'
import { stitchingDirectives, } from '@graphql-tools/stitching-directives' 





const i = new GraphQLObjectType({
  name: 'Test',
  fields: {
    hi: {
      type: new GraphQLObjectType({
        name: 'test2',
        fields: {}
      }),
      description: 'this is a description',
      extensions: {
        myNode: makeDirectiveNode('myNode', {})
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


        directives: [createDirective('is', { class: 'http://example.org#test' })]
      } as any
    }
  },
  description: "Hello this is a description"
});

let schema = new GraphQLSchema({
  types: [ i ]
})



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

function createDirective(name: string, args: Record<string, string>) {
  const arg = Object.entries(args).map(([ key, value ]) => {
    return {
      kind: Kind.ARGUMENT,
      name: {
        kind: Kind.NAME,
        value: key
      },
      value: {
        kind: Kind.STRING,
        value: value
      }
    }
  })

  return {
    kind: Kind.DIRECTIVE,
    name: {
      kind: Kind.NAME,
      value: name
    },
    arguments: arg
  }
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
console.log(printSchemaWithDirectives(schema))

// console.log(data.getDirective('is')?.astNode?.locations[0].loc?.startToken)

process.exit()

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