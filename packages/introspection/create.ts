import { BindingsResultSupport, StringSparqlQueryable, Term } from '@rdfjs/types';
import { GraphQLSchema, GraphQLString } from 'graphql';
import { camelize, createObject, getAllProperties, getCommentInfo, getLabelInfo, getOwlClasses, getProperties, IQueryContext } from './utils';
import {  } from '@graphql-tools/schema'

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

export async function createObjectFromType(context: IQueryContext, type: Term) {
  const propertyList = await getAllProperties(context, type);
  const properties: any = {};

  for (const term of propertyList) {
    properties[await getName(context, term)] = {
      description: await getComment(context, term),
      iri: term.value,
      type: GraphQLString
    }
  }

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

  const classes = (await getOwlClasses(context)).map(c => createObjectFromType(context, c));

  return new GraphQLSchema({
    types: await Promise.all(classes)
  })
}

