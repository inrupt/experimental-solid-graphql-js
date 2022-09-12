import { graphql, buildSchema } from 'graphql';
import gql from 'graphql-tag'

// Construct a schema, using GraphQL schema language
const schema = buildSchema(`
  type Query {
    a: String!
    b: B!
  }

  type B {
    c: String!
    d: String!
  }
`);

// The rootValue provides a resolver function for each API endpoint
var rootValue = {
  hello: () => {
    return 'Hello world!';
  },
};

// Run the GraphQL query '{ hello }' and print out the response
graphql({
  schema,
  source: '{ a, b }',
  fieldResolver(a, b, c, d) {
    console.log(a, b, c, d);
    return 's';
  }
  // rootValue
}).then((response) => {
  console.log(JSON.stringify(response, null, 2));
});
