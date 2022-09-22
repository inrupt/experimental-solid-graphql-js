import { PersonDocument } from './operations-types';
import { solidQuery } from '../lib/solidClient';
import { QueryEngine } from '@comunica/query-sparql-file';
import { QueryEngine as QueryEngineReasoning } from '@comunica/query-sparql-file-reasoning';
import { KeysRdfDereferenceConstantHylar } from '@comunica/reasoning-context-entries'
import path from 'path';
import { readFileSync } from 'fs';
import { buildSchema } from 'graphql';

// TODO: Only include code dev's have to write in these samples.

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
