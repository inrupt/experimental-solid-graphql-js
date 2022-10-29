// import { QueryEngine } from '@comunica/query-sparql';
import { QueryEngine } from '@comunica/query-sparql';
import { QueryEngine as LTEngine } from '@comunica/query-sparql-link-traversal';
import { Term } from '@rdfjs/types';
import { camelize, getCommentInfo, getLabelInfo, getOwlClasses, IQueryContext } from './utils';
import { https } from 'follow-redirects';
import { DataFactory } from 'n3';

const context = {
  sources: [
    "https://web.archive.org/web/20220614105937if_/http://xmlns.com/foaf/spec/20140114.rdf"
  ] as [string],
  lenient: true,
}


async function label(context: IQueryContext, term: Term) {
  const value = (await getLabelInfo(context, term))[0]?.value;
  return value ? camelize(value) : undefined;
}

// TODO: Fix errors here like escaping
function getFragment({ value }: Term) {
  const args: number[] = [];

  if (value.lastIndexOf("/") > 0) {
    args.push(value.lastIndexOf("/"));
  }

  if (value.lastIndexOf("#") > 0) {
    args.push(value.lastIndexOf("#"));
  }

  const i = Math.max(...args);

  return value.slice(i + 1);
}

async function fragment(context: IQueryContext, term: Term) {
  const value = getFragment(term);
  return value ? camelize(value) : undefined;
}

async function getUniqueName(context: IQueryContext, term: Term, names: Record<string, string>, prefix = '') {
  let value: string | undefined;
  let i = -1;

  function realVal() {
    return prefix + value + (i === 0 ? '' : i);
  }
  
  function clear() {
    if (value && (realVal() in names)) {
      value = undefined;
    }
  }

  while (!value) {
    i += 1;
    value = await label(context, term);
    clear();
    value ??= await fragment(context, term);
    clear();
  }
  
  return realVal();
}

function breakIndex(value: string) {
  // Find the index of the last '#' or '/' if no '#' exists
  const hashIndex = value.lastIndexOf('#');
  return (hashIndex === -1 ? value.lastIndexOf('/') : hashIndex);
}



async function getPrefix(lookup: string): Promise<string> {
  return new Promise((res, rej) => {
    https.get(`https://prefix.cc/reverse?uri=${lookup}`, response => {
      const data = response.responseUrl;
      res(data.slice(data.lastIndexOf('/') + 1));
    }).on('error', rej)
  });

  // console.log('looking up', namespace)
  // const res = await (await fetch(`https://prefix.cc/reverse?uri=${namespace}/&format=jsonld`)).json();
  // return Object.keys(res['@context'])[0];

  // This breaks several URIs including
  //   catching http://www.w3.org/2003/01/geo/wgs84_pos
  // SyntaxError: Unexpected token < in JSON at position 0
  //     at JSON.parse (<anonymous>)
  //     at Response.json (node:internal/deps/undici/undici:2303:23)
  //     at processTicksAndRejections (node:internal/process/task_queues:95:5)
  // catching http://www.w3.org/2000/01/rdf-schema
  // catching http://www.w3.org/2002/07/owl
  // const namespace = lookup.slice(0, breakIndex(lookup));
  // console.log('looking up', namespace)
  // const res = await (await fetch(`https://prefix.cc/reverse?uri=${namespace}/&format=jsonld`)).json();
  // return Object.keys(res['@context'])[0];
}

export function prefixFactory() {
  const cache: Record<string, string | undefined> = {};
  const request: Record<string, Promise<string> | undefined> = {};

  return (lookup: string): string | Promise<string> => {
    const namespace = lookup.slice(0, breakIndex(lookup));

    if (cache[namespace]) {
      return cache[namespace]!;
    }

    if (!request[namespace]) {
      request[namespace] = getPrefix(namespace);
      request[namespace]!.then(res => {
        cache[namespace] = res;
        return res;
      }).catch(() => {
        console.log('catching', namespace,)
        delete request[namespace];
      })
    }

    return request[namespace]!;
  }
}

async function createNames(context: IQueryContext, classes: Term[], baseTerms: string[], noPrefix = false) {
  const getPrefix = prefixFactory();

  async function getCleanPrefix(c: Term) {
    const p = await getPrefix(c.value);
    return `${camelize(p.split(':')[0])}_`
  }

  // First we need to create the
  const names: Record<string, string> = {};

  for (const c of classes) {
    // console.log(c.value, ontology, c.value.startsWith(ontology))
    const n = await getUniqueName(context, c, names, (baseTerms.includes(c.value) || noPrefix) ? '' : await getCleanPrefix(c));
    names[n] = c.value;
  }

  return names;
}

function invert(names: Record<string, string>) {
  const result: Record<string, string> = {};
  for (const key in names) {
    result[names[key]] = key;
  } return result;
}


export async function getOntologyData(sources: [string, ...string[]]): Promise<RunResult> {
  const ltengine = new LTEngine();
  const sparqlEngine = new QueryEngine();

  const coreClasses = await getOwlClasses({
    sparqlEngine,
    context
  });


  const props = sparqlEngine.queryBindings(`
  SELECT * WHERE { ?s a <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> }  
  `, context).then(ps => ps.map(data => data.get('s')!.value).toArray());
  // const props = await ps.map(data => data.get('s')!.value).toArray();

  // TODO: Optimise this part by making it streams based
  let unprocessed = coreClasses.map(data => data.value)
  const nodes = new Set<string>(unprocessed);

  let unprocessedProperties: string[] = [];
  const properties = new Set<string>();

  const propertyMap: Record<string, string[]> = {};
  const rangeMap: Record<string, string[]> = {};

  console.time('processing')
  while (unprocessed.length > 0 || unprocessedProperties.length > 0) {
    console.log('iter', unprocessed.length, unprocessedProperties.length)

    const _unprocessed = unprocessed;
    const _unprocessedProperties = unprocessedProperties;
    unprocessed = [];
    unprocessedProperties = [];

    const a = Promise.all(
      _unprocessed.map(async t => {
        console.log('processing ...', t)

        const results = await ltengine.queryBindings(`
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX foaf: <http://xmlns.com/foaf/0.1/>
      
      SELECT ?property WHERE {
        <${t}> rdfs:subClassOf*/^rdfs:domain ?property 
      }`,
          {
            sources: [
              ...sources,
              // "https://web.archive.org/web/20220614105937if_/http://xmlns.com/foaf/spec/20140114.rdf",
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

        console.log('processed ...', t)
      })
    )

      // TODO: Work out how to handle sub properties (probably just leave it up to inference?)


    // while (unprocessed.length > 0) {
    //   const t = unprocessed.pop()!;
      
    // }

    // while (unprocessedProperties.length > 0) {
    //   const t = unprocessedProperties.pop()!;

    const b = Promise.all(_unprocessedProperties.map(async t => {
      console.log('processing ...', t)

      const results = await ltengine.queryBindings(`
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    
    SELECT ?type WHERE {
      <${t}> rdfs:range ?type
    }`,
        {
          sources: [
            ...sources,
            // "https://web.archive.org/web/20220614105937if_/http://xmlns.com/foaf/spec/20140114.rdf",
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
      console.log('processed ...', t)
    }))

    await Promise.all([a, b])
  }
  console.timeEnd('processing')
    
  // }

  // TODO: Use getUniqueNames for each of these
  console.log('creating node names ...')
  const nodeNames = createNames({
    context,
    sparqlEngine: ltengine
  }, [...nodes].sort().map(t => DataFactory.namedNode(t)), coreClasses.map(x => x.value))

  console.log('creating property names ...')
  const propertyNames = createNames({
    context,
    sparqlEngine: ltengine
  }, [...properties].sort().map(t => DataFactory.namedNode(t)), await props)

  console.log('node names are')
  console.log(nodeNames)

  console.log('property names are', propertyNames)

  // console.log([...nodes], [...properties])
  // console.log(propertyMap)
  // // TODO: add 
  // console.log('-------------------------------------------------------');
  // console.log(rangeMap);

  const propertyData: Record<string, { name: string, classes: string[]; description?: string }> = {};
  const classes: Record<string, { name: string, properties: string[]; description?: string }> = {};

  // const invertedPropertyNames = invert(propertyNames);

  console.log('a')
  for (const name in await propertyNames) {
    const key = (await propertyNames)[name];

    let description;
    const comments = await getCommentInfo({ context, sparqlEngine: ltengine }, DataFactory.namedNode(key));
    if (comments.length > 0) {
      description = comments[0].value;
    }

    propertyData[key] = {
      name: name[0].toLowerCase() + name.slice(1),
      description,
      classes: rangeMap[key]
    }
  }

  for (const name in await nodeNames) {
    const key = (await nodeNames)[name];

    let description;
    const comments = await getCommentInfo({ context, sparqlEngine: ltengine }, DataFactory.namedNode(key));
    if (comments.length > 0) {
      description = comments[0].value;
    }

    classes[key] = {
      name,
      description,
      properties: propertyMap[key]
    }
  }

  return {
    classes,
    properties: propertyData
  }

  // console.log('--- returning ---')
  // console.log(JSON.stringify(returnValue, null, 2));






  // return returnValue;


  // invert(propertyNames)
  // invert(nodeNames)


}

interface RunResult {
  classes: Record<string, { name: string, properties: string[]; description?: string }>;
  properties: Record<string, { name: string, classes: string[]; description?: string }>;
}
