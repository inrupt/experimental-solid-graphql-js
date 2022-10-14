import { BindingsResultSupport, StringSparqlQueryable, Term } from '@rdfjs/types';
import { GraphQLSchema, GraphQLString, GraphQLObjectType } from 'graphql';
import { camelize, createObject, getAllProperties, getCommentInfo, getLabelInfo, getOwlClasses, getProperties, IQueryContext, getRangeInfo } from './utils';
import {  } from '@graphql-tools/schema'
import { DataFactory } from 'n3';

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
    return createCachedObjectFromType(context, term, cache)
  }
}

async function createCachedObjectFromType(context: IQueryContext, type: Term, cache: Record<string, any>) {
  return (cache[type.value] ??= memoized(() => createObjectFromType(context, type, cache)))();
}

async function createObjectFromType(context: IQueryContext, type: Term, cache: Record<string, any>) {
  console.log('creating object', type, await getName(context, type))
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
  const context = {
    sparqlEngine,
    context: {
      recoverBrokenLinks: true,
      sources: [ontology]
    }
  }

  const cache = {}

  const classes = await Promise.all(
    // TODO: Fix this - we need a memoized call here
    (await getOwlClasses(context)).map(c => createCachedObjectFromType(context, c, cache))
  );

  console.log(classes);

  return new GraphQLSchema({
    types: classes,
  })
}

