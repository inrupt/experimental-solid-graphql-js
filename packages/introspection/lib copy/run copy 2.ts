// import { QueryEngine } from '@comunica/query-sparql';
import { getOwlClasses, getProperties, predictAllClasses } from './utils';
import { QueryEngine as LTEngine } from '@comunica/query-sparql-link-traversal';
import { QueryEngine } from '@comunica/query-sparql';
import { DataFactory as DF } from 'n3';

const context = {
  sources: [
    "https://web.archive.org/web/20220614105937if_/http://xmlns.com/foaf/spec/20140114.rdf"
  ] as [string],
  lenient: true,
}

async function main() {
  const ltengine = new LTEngine();
  const sparqlEngine = new QueryEngine();

  const unprocessedNotes = await getOwlClasses({
    sparqlEngine,
    context
  });

  // TODO: Optimise this part by making it streams based
  const unprocessed = unprocessedNotes.map(data => data.value)
  const nodes = new Set(unprocessed);

  const unprocessedProperties = [];
  const properties = new Set();

  while (unprocessed.length > 0) {
    const t = unprocessed.pop()!;
    console.log('processing ...', t)

    const results = await ltengine.queryBindings(`
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    
    SELECT ?property WHERE {
      <${t}> rdfs:subClassOf*/^rdfs:domain ?property
    }`,
      {
        sources: [
          "https://web.archive.org/web/20220614105937if_/http://xmlns.com/foaf/spec/20140114.rdf",
          t
        ],
        lenient: true,
      }
    )

    const data = await results.map(elem => elem.get('property')!.value).toArray();

    for (const elem of data) {
      if (!properties.has(elem)) {
        properties.add(elem);
        unprocessedProperties.push(elem);
      }
    }
    
    // const results = await ltengine.queryBindings(`
    // PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    // PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    
    // SELECT ?type WHERE {
    //   <${t}> (rdfs:subClassOf*/^rdfs:domain/rdfs:range) ?type
    // }`,
    //   {
    //     sources: [
    //       "https://web.archive.org/web/20220614105937if_/http://xmlns.com/foaf/spec/20140114.rdf",
    //       t
    //     ],
    //     lenient: true,
    //   }
    // )

    // for (const elem of await results.toArray()) {
    //   const term = elem.get('type')!.value;
    //   if (!data.has(term)) {
    //     data.add(term);
    //     unprocessed.push(term);
    //   } 
    // }
  }

  console.log([...nodes])
}

main();
