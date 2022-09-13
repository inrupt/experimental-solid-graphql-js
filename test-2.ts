import { graphql, buildSchema } from 'graphql';
import gql from 'graphql-tag'

// Construct a schema, using GraphQL schema language
const schema = buildSchema(`
  type Query {
    me(id: String): Human!
  }

  type Human {
    id: String!
    name: String!
    mother: Human
    father: Human
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
  source: '{ me(id: "https://id.inrupt.com/jeswr") { name, mother { name }, father { name } } }',
  fieldResolver(source, args, context, info) {
    console.log(source, args, context, info.fieldName)

    if (args.id)
      return args.id;
    
    return 's'
  }
  // rootValue
}).then((response) => {
  console.log(JSON.stringify(response, null, 2));
});
