import { PersonDocument } from './operations-types';
import { solidQuery } from '../lib/solidClient';
import { QueryEngine } from '@comunica/query-sparql-file';
import path from 'path';
import { readFileSync } from 'fs';
import { buildSchema } from 'graphql';

const result = solidQuery({
  document: PersonDocument,
  schema: buildSchema(readFileSync(path.join(__dirname, './human.graphql'), 'utf-8')),
  variables: {
    id: "https://id.inrupt.com/jeswr"
  },
  context: {
    sparqlEngine: new QueryEngine(),
    context: {
      sources: [
        path.join(__dirname, 'data.ttl')
      ]
    }
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
}).catch(error => {
  console.error(error);
})
