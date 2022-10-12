import { GraphQLSchema, GraphQLObjectType, print, GraphQLFieldConfig, GraphQLOutputType, GraphQLAbstractType, ConstDirectiveNode } from 'graphql';
import { printSchema, buildSchema } from 'graphql';

import { DirectiveUsage, makeDirectiveNode, printSchemaWithDirectives } from '@graphql-tools/utils'
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
      }
      
    }
  },
  description: "Hello this is a description"
});

const schema = new GraphQLSchema({
  types: [ i ]
})

const data = buildSchema(`
directive @is(iri: String!) on OBJECT

type Person @is(iri: "http://example.org#Person") {
  name: String!
}
`)

console.log(data.getDirectives()[0].astNode?.locations);

console.log(printSchemaWithDirectives(data))
