import { Client } from 'urql';
import { makeExecutableSchema } from '@graphql-tools/schema'
import { PersonDocument } from './operations-types';
import { useQuery } from '@apollo/client';
import { propertyDirective } from '../src/resolvers/propertyDirective';
import { graphql } from 'graphql';

let schema = makeExecutableSchema({
  typeDefs: PersonDocument
})

schema = propertyDirective('property')(schema)

const source = /* GraphQL */ `
  {
    me(id: "https://id.inrupt.com/jeswr") {
      label,
      mother {
        label
      },
      father {
        label
      }
    }
  }
`

graphql({
  schema,
  source,
}).then((response) => {
  console.log(response)
});
