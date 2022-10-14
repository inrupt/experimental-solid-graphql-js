import { QueryEngine } from '@comunica/query-sparql-file';
import { wrap } from 'asynciterator';

async function main() {
  return wrap(new QueryEngine().queryBindings(`
    SELECT * WHERE {
      ?s <http://www.w3.org/2000/01/rdf-schema#subClassOf>*/<http://www.w3.org/2000/01/rdf-schema#domain> <http://xmlns.com/foaf/0.1/Person> }
    `, {
      sources: [ 'https://web.archive.org/web/20220614105937if_/http://xmlns.com/foaf/spec/20140114.rdf' ]
    })).map(b => b.get('s')).toArray();
}

// main().then(r => {
//   console.log(r)
//   fs
// })
