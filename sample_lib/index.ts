import { PersonDocument } from './operations-types';
import { solidQuery } from '../lib/solidClient';
import { QueryEngine } from '@comunica/query-sparql-file';
import { QueryEngine as QueryEngineReasoning } from '@comunica/query-sparql-file-reasoning';
import { KeysRdfDereferenceConstantHylar } from '@comunica/reasoning-context-entries'
import path from 'path';
import { readFileSync } from 'fs';
import { buildSchema, print } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';

// TODO: Only include code dev's have to write in these samples.

// export const SearchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"search"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"search"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Album"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"genre"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"artist"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"songs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Artist"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Playlist"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]};

// console.log(print(SearchDocument as any))

// makeExecutableSchema()

// process.exit();


// console.log(print(PersonDocument))
// console.log('------------------------------------------------------------')
// console.log(readFileSync(path.join(__dirname, './human.graphql'), 'utf-8'))

const result = solidQuery({
  document: PersonDocument,
  schema: buildSchema(readFileSync(path.join(__dirname, './human.graphql'), 'utf-8')),
  variables: {
    id: "https://id.inrupt.com/jeswr"
  },
  context: {
    // sparqlEngine: new QueryEngine(),
    sparqlEngine: new QueryEngineReasoning(),
    context: {
      sources: [
        path.join(__dirname, 'data.ttl'),
        path.join(__dirname, 'ontology.ttl'),
        // path.join(__dirname, 'data.ttl'),
        // path.join(__dirname, 'data.ttl'),
      ],
      rules: KeysRdfDereferenceConstantHylar.owl2rl,
    },
  }
});

result.then(r => {
  const data = r.data;
  console.log(data)

  if (!data) {
    throw new Error(`${r.errors}`);
  }
  
  const name = data.me.label;
  const birthDate = data.me.birthDate;

  if (birthDate) {
    console.log(`${name} was born on ${birthDate.toDateString()}`)
  } else {
    console.log(`No date of birth defined for ${name}`)
  }

  // data.me.father.name

  console.log(`${name} has ancestors by the names of "${data.me.ancestors?.map(x => x.name).join("\", \"")}"`)
}).catch(error => {
  console.error(error);
})
