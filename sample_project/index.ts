import { PersonDocument } from './operations-types';
import { useQuery } from '@apollo/client';
import { makeExecutableSchema } from "@graphql-tools/schema";

// const documentNode = makeExecutableSchema({
//   typeDefs: PersonDocument
// });

// We now have types support and auto complete for the
// result type, just by passing `RatesDocument` as `query` to apollo client.
const result = useQuery(PersonDocument, {
  variables: {
    id: "https://id.inrupt.com/jeswr",
  },
  
});

const me = result.data?.me

if (me) {
  me.mother?.birthDate
}
