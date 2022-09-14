import { makeExecutableSchema } from '@graphql-tools/schema'
import { graphql, buildSchema, defaultFieldResolver, DirectiveLocation, GraphQLDirective, GraphQLSchema } from 'graphql';
import gql from 'graphql-tag'
// import { SolidGraphQLClient } from './src/solidGraphqlClient';
import { SparqlEngine } from './src/sparqlEngine';
import { QueryEngine } from '@comunica/query-sparql';
import { Store, DataFactory as DF } from 'n3';
import { mapSchema, MapperKind, getDirective } from '@graphql-tools/utils';

const typeDefs = /* GraphQL */ `
  directive @upper on FIELD_DEFINITION

  type Query {
    me(id: String): Human!
  }

  type Human {
    id: String!
    label: String! @upper
  }
`;

const source = /* GraphQL */ `
  {
    me(id: "https://id.inrupt.com/jeswr") {
      label
    }
  }
`

let schema = makeExecutableSchema({
  typeDefs,
})

function fieldResolver() {
  return 's'
}

function upperDirective(directiveName: string): (schema: GraphQLSchema) => GraphQLSchema {
  return schema =>
    mapSchema(schema, {
      [MapperKind.OBJECT_FIELD]: fieldConfig => {
        const upperDirective = getDirective(schema, fieldConfig, directiveName)?.[0]
        if (upperDirective) {
          const { resolve = fieldResolver } = fieldConfig
          return {
            ...fieldConfig,
            resolve: async function (source, args, context, info) {
              const result = await resolve(source, args, context, info)
              console.log('internal resolve called', result)
              if (typeof result === 'string') {
                return result.toUpperCase()
              }
              return result
            }
          }
        }
        return fieldConfig;
      }
    })
}

schema = upperDirective('upper')(schema);



graphql({
  schema,
  source,
  fieldResolver,
}).then((response) => {
  console.log(JSON.stringify(response, null, 2));
});

