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
  const nodes = new Set<string>(unprocessed);

  const unprocessedProperties: string[] = [];
  const properties = new Set<string>();

  const propertyMap: Record<string, string[]> = {};
  const rangeMap: Record<string, string[]> = {};

  while (unprocessed.length > 0 || unprocessedProperties.length > 0) {

    while (unprocessed.length > 0) {
      const t = unprocessed.pop()!;
      console.log('processing ...', t)

      const results = await ltengine.queryBindings(`
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    
    SELECT ?property WHERE {
      <${t}> rdfs:subClassOf*/^rdfs:domain ?property .
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

      propertyMap[t] = [...new Set(data)];

      for (const elem of data) {
        if (!properties.has(elem)) {
          properties.add(elem);
          unprocessedProperties.push(elem);
        }
      }
    }

    

    while (unprocessedProperties.length > 0) {
      const t = unprocessedProperties.pop()!;
      console.log('processing ...', t)

      const results = await ltengine.queryBindings(`
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    
    SELECT ?type WHERE {
      <${t}> rdfs:range ?type
    }`,
        {
          sources: [
            "https://web.archive.org/web/20220614105937if_/http://xmlns.com/foaf/spec/20140114.rdf",
            t
          ],
          lenient: true,
        }
      )

      const data = await results.map(elem => elem.get('type')!.value).toArray();
      rangeMap[t] = [...new Set(data)];

      for (const elem of data) {
        if (!nodes.has(elem)) {
          nodes.add(elem);
          unprocessed.push(elem);
        }
      }
    }
  }

  console.log([...nodes], [...properties])
  console.log(propertyMap)
  // TODO: add 
  console.log('-------------------------------------------------------');
  console.log(rangeMap);
}

main();
