import { QueryEngine } from '@comunica/query-sparql-link-traversal';

const engine = new QueryEngine();

async function test() {
  const result = await engine.queryBindings('SELECT DISTINCT * WHERE { <http://xmlns.com/foaf/0.1/Person> <http://www.w3.org/2000/01/rdf-schema#subClassOf>* ?o }', {
    recoverBrokenLinks: true, // This is not working yet
    sources: [ 'https://web.archive.org/web/20220614105937if_/http://xmlns.com/foaf/spec/20140114.rdf' ],
    lenient: true
  });
  console.log(await result.map(r => r.get('o')).toArray())
}

test();
