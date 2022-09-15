import { PersonDocument } from './operations-types';
import { useQuery } from '@apollo/client';

// We now have types support and auto complete for the
// result type, just by passing `RatesDocument` as `query` to apollo client.
const result = useQuery(PersonDocument, {
  variables: {
    id: "https://id.inrupt.com/jeswr",
  },
});

const rates = result.data?.me.label;
