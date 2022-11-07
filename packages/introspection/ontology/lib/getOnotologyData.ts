//
// Copyright 2022 Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
import { QueryEngine } from "@comunica/query-sparql";
import { QueryEngine as LTEngine } from "@comunica/query-sparql-link-traversal";
import type { Term } from "@rdfjs/types";
import { https } from "follow-redirects";
import { DataFactory } from "n3";
import type { IQueryContext } from "./utils";
import { camelize, getCommentInfo, getLabelInfo, getOwlClasses } from "./utils";

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

// Reserved keys
const reserved: Record<string, boolean | undefined> = {
  id: true,
};

async function getUniqueName(
  context: IQueryContext,
  term: Term,
  names: Record<string, string>,
  prefix = ""
) {
  let value: string | undefined;
  let i = -1;

  function realVal() {
    return prefix + value + (i === 0 ? "" : i);
  }

  function clear() {
    if (value && (reserved[realVal()] || realVal() in names)) {
      value = undefined;
    }
  }

  while (!value) {
    i += 1;
    // eslint-disable-next-line no-await-in-loop
    value = await label(context, term);
    clear();
    // eslint-disable-next-line no-await-in-loop
    value ??= await fragment(context, term);
    clear();
  }

  return realVal();
}

function breakIndex(value: string) {
  // Find the index of the last '#' or '/' if no '#' exists
  const hashIndex = value.lastIndexOf("#");
  return hashIndex === -1 ? value.lastIndexOf("/") : hashIndex;
}

export function prefixFactory() {
  async function getPrefix(lookup: string): Promise<string> {
    return new Promise((res, rej) => {
      https
        .get(`https://prefix.cc/reverse?uri=${lookup}`, (response) => {
          const data = response.responseUrl;
          res(data.slice(data.lastIndexOf("/") + 1));
        })
        .on("error", rej);
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

  const cache: Record<string, string> = {};
  const request: Record<string, Promise<string>> = {};

  return (lookup: string): string | Promise<string> => {
    const namespace = lookup.slice(0, breakIndex(lookup));

    if (cache[namespace]) {
      return cache[namespace];
    }

    if (!request[namespace]) {
      request[namespace] = getPrefix(namespace);
      request[namespace]
        .then((res) => {
          cache[namespace] = res;
          return res;
        })
        .catch(() => {
          delete request[namespace];
        });
    }

    return request[namespace];
  };
}

async function createNames(
  context: IQueryContext,
  classes: Term[],
  baseTerms: string[],
  noPrefix = false
) {
  const getPrefix = prefixFactory();

  async function getCleanPrefix(c: Term) {
    const p = await getPrefix(c.value);
    return `${camelize(p.split(":")[0])}`;
  }

  // First we need to create the
  const names: Record<string, string> = {};

  for (const c of classes) {
    // eslint-disable-next-line no-await-in-loop
    const n = await getUniqueName(
      context,
      c,
      names,
      // eslint-disable-next-line no-await-in-loop
      baseTerms.includes(c.value) || noPrefix ? "" : await getCleanPrefix(c)
    );
    names[n] = c.value;
  }

  return names;
}

export async function getOntologyData(
  sources: [string, ...string[]]
): Promise<RunResult> {
  const context = {
    sources,
    // TODO: Only enable this in the lt case
    lenient: true,
  };

  const ltengine = new LTEngine();
  const sparqlEngine = new QueryEngine();

  const coreClasses = await getOwlClasses({
    sparqlEngine,
    context,
  });

  const props = sparqlEngine
    .queryBindings(
      `
  SELECT * WHERE { ?s a <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> }  
  `,
      context
    )
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .then((ps) => ps.map((data) => data.get("s")!.value).toArray());

  // TODO: Optimise this part by making it streams based
  let unprocessed = coreClasses.map((data) => data.value);
  const nodes = new Set<string>(unprocessed);

  let unprocessedProperties: string[] = [];
  const properties = new Set<string>();

  const propertyMap: Record<string, string[]> = {};
  const rangeMap: Record<string, string[]> = {};

  while (unprocessed.length > 0 || unprocessedProperties.length > 0) {
    const tempUnprocessed = unprocessed;
    const tempUnprocessedProperties = unprocessedProperties;
    unprocessed = [];
    unprocessedProperties = [];

    const a = Promise.all(
      // eslint-disable-next-line no-loop-func
      tempUnprocessed.map(async (t) => {
        // TODO: Remove stuff like rdf:subClassOf* when we have a link traversal engine
        // with reasoning
        const results = await ltengine.queryBindings(
          `
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX foaf: <http://xmlns.com/foaf/0.1/>
      
      SELECT ?property WHERE {
        <${t}> rdfs:subClassOf*/^rdfs:domain ?property 
      }`,
          {
            sources: [
              ...sources,
              // "https://web.archive.org/web/20220614105937if_/http://xmlns.com/foaf/spec/20140114.rdf",
              t,
            ],
            lenient: true,
          }
        );

        // eslint-disable-next-line no-await-in-loop
        const data = await results
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          .map((elem) => elem.get("property")!.value)
          .toArray();

        propertyMap[t] = [...new Set(data)];

        for (const elem of data) {
          if (!properties.has(elem)) {
            properties.add(elem);
            unprocessedProperties.push(elem);
          }
        }
      })
    );

    // TODO: Work out how to handle sub properties (probably just leave it up to inference?)

    // while (unprocessed.length > 0) {
    //   const t = unprocessed.pop()!;

    // }

    // while (unprocessedProperties.length > 0) {
    //   const t = unprocessedProperties.pop()!;

    const b = Promise.all(
      // eslint-disable-next-line no-loop-func
      tempUnprocessedProperties.map(async (t) => {
        const results = await ltengine.queryBindings(
          `
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    
    SELECT ?type WHERE {
      <${t}> rdfs:range ?type
    }`,
          {
            sources: [
              ...sources,
              // "https://web.archive.org/web/20220614105937if_/http://xmlns.com/foaf/spec/20140114.rdf",
              t,
            ],
            lenient: true,
          }
        );

        const data = await results
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          .map((elem) => elem.get("type")!.value)
          .toArray();
        rangeMap[t] = [...new Set(data)];

        for (const elem of data) {
          if (!nodes.has(elem)) {
            nodes.add(elem);
            unprocessed.push(elem);
          }
        }
      })
    );

    // eslint-disable-next-line no-await-in-loop
    await Promise.all([a, b]);
  }

  // }

  // TODO: Use getUniqueNames for each of these
  const nodeNames = createNames(
    {
      context,
      sparqlEngine: ltengine,
    },
    [...nodes].sort().map((t) => DataFactory.namedNode(t)),
    coreClasses.map((x) => x.value)
  );

  const propertyNames = createNames(
    {
      context,
      sparqlEngine: ltengine,
    },
    [...properties].sort().map((t) => DataFactory.namedNode(t)),
    await props
  );

  const propertyData: Record<
    string,
    { name: string; classes: string[]; description?: string }
  > = {};
  const classes: Record<
    string,
    { name: string; properties: string[]; description?: string }
  > = {};

  for (const propertyName of Object.keys(await propertyNames)) {
    // eslint-disable-next-line no-await-in-loop
    const key = (await propertyNames)[propertyName];

    let description;
    // eslint-disable-next-line no-await-in-loop
    const comments = await getCommentInfo(
      { context, sparqlEngine: ltengine },
      DataFactory.namedNode(key)
    );
    if (comments.length > 0) {
      description = comments[0].value;
    }

    propertyData[key] = {
      name: propertyName[0].toLowerCase() + propertyName.slice(1),
      description,
      classes: rangeMap[key],
    };
  }
  // eslint-disable-next-line no-await-in-loop
  for (const nodeName of Object.keys(await nodeNames)) {
    // eslint-disable-next-line no-await-in-loop
    const key = (await nodeNames)[nodeName];

    let description;
    // eslint-disable-next-line no-await-in-loop
    const comments = await getCommentInfo(
      { context, sparqlEngine: ltengine },
      DataFactory.namedNode(key)
    );
    if (comments.length > 0) {
      description = comments[0].value;
    }

    classes[key] = {
      name: nodeName,
      description,
      properties: propertyMap[key],
    };
  }

  const nonEmptyClasses: Record<
    string,
    { name: string; properties: string[]; description?: string }
  > = {};

  // This is to avoid the generation of types with no properties. An example of this occurs in FOAF with the
  // foaf:labelProperty
  //
  //
  // """
  // A foaf:LabelProperty is any RDF property with texual values that serve as labels.
  // """
  // type LabelProperty @is(class: "http://xmlns.com/foaf/0.1/LabelProperty")
  //

  for (const key of Object.keys(classes)) {
    if (classes[key].properties.length > 0) {
      nonEmptyClasses[key] = classes[key];
    }
  }

  return {
    classes: nonEmptyClasses,
    properties: propertyData,
  };
}

interface RunResult {
  classes: Record<
    string,
    { name: string; properties: string[]; description?: string }
  >;
  properties: Record<
    string,
    { name: string; classes: string[]; description?: string }
  >;
}
