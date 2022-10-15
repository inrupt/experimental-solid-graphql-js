import { BindingsResultSupport, StringSparqlQueryable, Term } from '@rdfjs/types';
import { GraphQLSchema, GraphQLString, GraphQLObjectType } from 'graphql';
import { camelize, createObject, getAllProperties, getCommentInfo, getLabelInfo, getOwlClasses, getProperties, IQueryContext, getRangeInfo, predictAllClasses } from './utils';
import {  } from '@graphql-tools/schema'
import { DataFactory } from 'n3';
import { QueryEngine as QueryEngineLinkTraversal } from '@comunica/query-sparql-link-traversal'

// TODO: Fix errors here like escaping
function getFragment({ value }: Term) {
  const args: number[] = [];

  if (value.lastIndexOf('/') > 0) {
    args.push(value.lastIndexOf('/'))
  }

  if (value.lastIndexOf('#') > 0) {
    args.push(value.lastIndexOf('#'))
  }

  const i = Math.max(...args);

  return value.slice(i + 1);
}

async function getName(context: IQueryContext, term: Term): Promise<string> {
  const value = (await getLabelInfo(context, term))[0]?.value
    ?? getFragment(term);

  return camelize(value);
}

async function getComment(context: IQueryContext, term: Term): Promise<string | undefined> {
  return (await getCommentInfo(context, term))[0]?.value
}

function memoized(f: Function) {
  let res: any;
  return () => {
    if (!res) {
      res = f();
    }
    return res;
  }
}

// TODO: Fix this typing
// async function getCachedType(context: IQueryContext, term: Term, cache: Record<string, any>) {
//   // TODO: TermType checks
//   // If the term is not in the cache then cache it

//   cache[term.value] ??= memoized(() => getType(context, term, cache));
//   console.log(cache[term.value]())
  

//   return cache[term.value]();
// }

async function getType(context: IQueryContext, term: Term, cache: Record<string, any>) {
  const rangeList = await getRangeInfo(context, term);

  if (rangeList.length !== 1) {
    return null;
  }

  const [ range ] = rangeList;

  if (DataFactory.namedNode('http://www.w3.org/2000/01/rdf-schema#Literal').equals(range)) {
    return GraphQLString;
  } else {
    // TODO: Check this
    return createCachedObjectFromType(context, range, cache)
  }
}

async function createCachedObjectFromType(context: IQueryContext, type: Term, cache: Record<string, any>) {
  console.log('caching', type.value);
  return (cache[type.value] ??= memoized(() => createObjectFromType(context, type, cache)))();
}

async function createObjectFromType(context: IQueryContext, type: Term, cache: Record<string, any>) {
  // console.log('creating object', type, await getName(context, type))
  const propertyList = await getAllProperties(context, type);
  const properties: any = {};

  for (const term of propertyList) {
    properties[await getName(context, term)] = {
      description: await getComment(context, term),
      iri: term.value,
      type: await getType(context, term, cache),
    }
  }
  //
  return createObject({
    class: type.value,
    name: await getName(context, type),
    properties: properties,
    description: await getComment(context, type)
  })







  // {
  //   iri: string;
  //   type: GraphQLOutputType;
  //   description: string;
  // }

  // for (const property of properties) {
  //   console.log(property, await getRangeInfo(context, property), camelize((await getLabelInfo(context, property))[0].value))
  // }
}

// TODO: See if we need to generate additional types by dereferencing other documents
export async function makeSchema(sparqlEngine: StringSparqlQueryable<BindingsResultSupport>, ontology: string) {
  console.log('make schema called')

  const context = {
    sparqlEngine,
    context: {
      recoverBrokenLinks: true,
      sources: [ontology]
    }
  }

  // TODO: Make this a link traversal context
  const Fullcontext = context;
  // const Fullcontext = {
  //   sparqlEngine,
  //   context: {
  //     recoverBrokenLinks: true,
  //     sources: [
  //       ontology,
  //       // 'www.w3.org/2002/07/owl',
  //       'http://www.w3.org/2003/01/geo/wgs84_pos',
  //       'http://www.w3.org/2000/01/rdf-schema'
  //     ],
  //     lenient: true
  //   }
  // }

  const cache = {}

  const owlClasses = await getOwlClasses(context);
  
  // TODO: Enable this to get unique naming in schemas
  // console.log('a')

  // const c = new Set(([] as Term[]).concat(...await Promise.all(
  //   owlClasses.map(cls => predictAllClasses({
  //     sparqlEngine,
  //     // sparqlEngine: new QueryEngineLinkTraversal(),
  //     context: {
        // sources: [
        //   ontology,
        //   'www.w3.org/2002/07/owl',
        //   'http://www.w3.org/2003/01/geo/wgs84_pos',
        //   'http://www.w3.org/2000/01/rdf-schema'
        // ],
  //       lenient: true,
  //     }
  //   }, cls))
  // )).map(term => term.value)).values();

  // const values = [...c].sort();

  // console.log('b')

  // console.log(values)
  
  
  

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

  console.log('before all')
  const classes = await Promise.all(
    // TODO: Fix this - we need a memoized call here
    owlClasses.map(c => createCachedObjectFromType(Fullcontext, c, cache))
  );
  console.log('after all')

  // console.log(classes);

  return new GraphQLSchema({
    types: classes,
  })
}

