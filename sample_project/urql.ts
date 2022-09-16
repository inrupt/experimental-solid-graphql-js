import { Client } from 'urql';
import { makeExecutableSchema } from '@graphql-tools/schema'
import { PersonDocument } from './operations-types';
import { useQuery } from '@apollo/client';
import { propertyDirective } from '../src/resolvers/propertyDirective';

let schema = makeExecutableSchema({
  typeDefs: PersonDocument
})

schema = propertyDirective('property')(schema)


const client = new Client({ url: 'http://example.org/' });
client.query(PersonDocument, { id: 'http://id.inrupt.com/jeswr' }, { data: 'hi' })
  .toPromise()
  .then(res => {
    console.log(res)
  })

