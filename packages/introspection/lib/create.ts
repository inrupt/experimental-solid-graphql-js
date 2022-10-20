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
import {
  BindingsResultSupport,
  StringSparqlQueryable,
  Term,
} from "@rdfjs/types";
import { GraphQLSchema, GraphQLString } from "graphql";
import { DataFactory } from "n3";
import {
  camelize,
  createObject,
  getAllProperties,
  getCommentInfo,
  getLabelInfo,
  getOwlClasses,
  getRangeInfo,
  IQueryContext,
  predictAllClasses,
} from "./utils";
// import { QueryEngine as QueryEngineLinkTraversal } from '@comunica/query-sparql-link-traversal';

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

async function getName(context: IQueryContext, term: Term): Promise<string> {
  const value =
    (await getLabelInfo(context, term))[0]?.value ?? getFragment(term);

  return camelize(value);
}

async function getComment(
  context: IQueryContext,
  term: Term
): Promise<string | undefined> {
  return (await getCommentInfo(context, term))[0]?.value;
}

function memoized<T>(f: () => T): () => T {
  let res: T;
  return () => {
    if (!res) {
      res = f();
    }
    return res;
  };
}

// TODO: Fix this typing
// async function getCachedType(context: IQueryContext, term: Term, cache: Record<string, any>) {
//   // TODO: TermType checks
//   // If the term is not in the cache then cache it

//   cache[term.value] ??= memoized(() => getType(context, term, cache));
//   console.log(cache[term.value]())

//   return cache[term.value]();
// }

async function getType(
  context: IQueryContext,
  term: Term,
  cache: Record<string, any>,
  names: Record<string, string>
) {
  const rangeList = await getRangeInfo(context, term);

  if (rangeList.length !== 1) {
    return null;
  }

  const [range] = rangeList;

  if (
    DataFactory.namedNode(
      "http://www.w3.org/2000/01/rdf-schema#Literal"
    ).equals(range)
  ) {
    return GraphQLString;
  }
  // TODO: Check this
  return createCachedObjectFromType(context, range, cache, names);
}

async function createCachedObjectFromType(
  context: IQueryContext,
  type: Term,
  cache: Record<string, any>,
  names: Record<string, string>
) {
  // console.log("caching", type.value);
  // eslint-disable-next-line no-return-assign
  return cache[type.value] ??= createObjectFromType(context, type, cache, names)
  // return (cache[type.value] ??= memoized(() =>
  //   createObjectFromType(context, type, cache, names)
  // ))();
}

async function createObjectFromType(
  context: IQueryContext,
  type: Term,
  cache: Record<string, any>,
  names: Record<string, string>
) {
  console.log('creating object', names[type.value])
  const propertyList = await getAllProperties(context, type);
  const properties: any = {};

  for (const term of propertyList) {
    // eslint-disable-next-line no-await-in-loop
    properties[await getName(context, term)] = {
      // eslint-disable-next-line no-await-in-loop
      description: await getComment(context, term),
      iri: term.value,
      // eslint-disable-next-line no-await-in-loop
      type: await getType(context, term, cache, names),
    };
  }
  console.log('created', names[type.value])
  return createObject({
    class: type.value,
    name: names[type.value],
    properties,
    description: await getComment(context, type),
  });

  // {
  //   iri: string;
  //   type: GraphQLOutputType;
  //   description: string;
  // }

  // for (const property of properties) {
  //   console.log(property, await getRangeInfo(context, property), camelize((await getLabelInfo(context, property))[0].value))
  // }
}

import { prefixFactory } from './testprefix';

// TODO: See if we need to generate additional types by dereferencing other documents
export async function makeSchema(
  sparqlEngine: StringSparqlQueryable<BindingsResultSupport>,
  ontology: string
) {
  console.log("make schema called");

  const context = {
    sparqlEngine,
    context: {
      recoverBrokenLinks: true,
      sources: [ontology],
    },
  };

  // TODO: Make this a link traversal context
  // const Fullcontext = context;
  const Fullcontext = {
    sparqlEngine,
    context: {
      recoverBrokenLinks: true,
      sources: [
        ontology,
        // 'www.w3.org/2002/07/owl',
        'http://www.w3.org/2003/01/geo/wgs84_pos',
        'http://www.w3.org/2000/01/rdf-schema'
      ],
      lenient: true
    }
  }

  const cache = {};

  const owlClasses = await getOwlClasses(context);

  // TODO: Enable this to get unique naming in schemas
  console.log('a', owlClasses.length)

  // TODO: Properly use link traversal here
  const c = new Set(([] as Term[]).concat(...await Promise.all(
    owlClasses.map(cls => predictAllClasses({
      sparqlEngine,
      // sparqlEngine: new QueryEngineLinkTraversal(),
      context: {
  sources: [
    ontology,
    'www.w3.org/2002/07/owl',
    'http://www.w3.org/2003/01/geo/wgs84_pos',
    'http://www.w3.org/2000/01/rdf-schema'
  ],
        lenient: true,
      }
    }, cls))
  )).map(term => term.value)).values();

  const values = [...c].sort();

  console.log('b', values.length);

  // const getPrefix = prefixFactory();

  // First we need to create the
  // const names: Record<string, string> = {};

  

  // const prefixes = await Promise.all(values.map(value => getPrefix(value)))
  
  // console.log('http://www.w3.org/2000/01/rdf-schema#Class', await getPrefix('http://www.w3.org/2000/01/rdf-schema'))
  // console.log(prefixes)


  console.log(values)

  const names = await createNames(Fullcontext, values.map(value => DataFactory.namedNode(value)), 'http://xmlns.com/foaf/0.1/');
  console.log(names)
  console.log(invert(names))

  // predictAllClasses({
  //   sparqlEngine: new QueryEngineLinkTraversal(),
  // }, )

  // const classes: Record<string, string> = {};

  // for (const c of owlClasses) {
  //   for (const p of await getAllProperties(context, c)) {
  //     for (const r of await getRangeInfo(context, p)) {

  //     }
  //   }
  // }

  // const cs = owlClasses.map(async type => {
  //   const props = await getAllProperties(context, type);
  //   return props.map(p => getRangeInfo(context, p))
  // });

  // cs

  // await getAllProperties(context, type)
  // await getType(context, term, cache)

  // console.log("before all");
  console.log('before class generation')
  const classes = await Promise.all(
    // TODO: Fix this - we need a memoized call here
    owlClasses.map((c) => createCachedObjectFromType(Fullcontext, c, cache, invert(names)))
  );
  // console.log("after all");

  // console.log(classes);

  console.log('the classes have been generated', classes.length)

  return new GraphQLSchema({
    types: classes,
  });
}

async function getName2(context: IQueryContext, term: Term): Promise<string> {
  const value =
    (await getLabelInfo(context, term))[0]?.value ?? getFragment(term);

  return camelize(value);
}

async function label(context: IQueryContext, term: Term) {
  const value = (await getLabelInfo(context, term))[0]?.value;
  return value ? camelize(value) : undefined;
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

async function createNames(context: IQueryContext, classes: Term[], ontology: string) {
  const getPrefix = prefixFactory();

  async function getCleanPrefix(c: Term) {
    const p = await getPrefix(c.value);
    return `${camelize(p.split(':')[0])}_`
  }

  // First we need to create the
  const names: Record<string, string> = {};

  for (const c of classes) {
    console.log(c.value, ontology, c.value.startsWith(ontology))
    const n = await getUniqueName(context, c, names, c.value.startsWith(ontology) ? '' : await getCleanPrefix(c));
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
