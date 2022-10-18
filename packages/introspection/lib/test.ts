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
import {} from "@graphql-tools/schema";
import {
  Bindings,
  BindingsResultSupport,
  QueryContext,
  StringSparqlQueryable,
  Term,
} from "@rdfjs/types";
import { wrap } from "asynciterator";
import { DataFactory as DF } from "n3";
// import { cre  } from '@graphql-tools/utils';

export interface IQueryContext {
  sparqlEngine: StringSparqlQueryable<BindingsResultSupport>;
  context: QueryContext;
}

const RDFS = "http://www.w3.org/2000/01/rdf-schema#";

/**
 * Gets a single term out of a set of bindings with size 1
 * @param bindings Result of a SPARQL Query
 * @returns The single term in the Bindings
 */
export function getSingleBinding(bindings: Bindings): Term {
  if (bindings.size !== 1) {
    throw new Error(`Expected 1 term in bindings, received ${bindings.size}`);
  }

  // eslint-disable-next-line no-unreachable-loop
  for (const value of bindings.values()) return value;

  throw new Error(`Expected 1 term in bindings, received 0`);
}

async function runQuery(context: IQueryContext, query: string) {
  return (
    wrap(context.sparqlEngine.queryBindings(query, context.context))
      .map((binding) => getSingleBinding(binding))
      // .filter((result): result is NamedNode => {
      //   if (result?.termType !== 'NamedNode') {
      //     throw new Error(`Expected ${result?.value} to be a NamedNode, received ${result?.termType}`)
      //   }
      //   return true;
      // })
      .toArray()
  );
}

function getProperties(context: IQueryContext, type: Term) {
  if (type.termType !== "NamedNode") {
    throw new Error("Expected NamedNode");
  }

  return runQuery(
    context,
    `SELECT * WHERE { ?s <${RDFS}domain> <${type.value}> }`
  );
}

async function getRangeInfo(context: IQueryContext, term: Term) {
  return runQuery(
    context,
    `SELECT * WHERE { <${term.value}> <${RDFS}range> ?o }`
  );
}

async function getLabelInfo(context: IQueryContext, term: Term) {
  return runQuery(
    context,
    `SELECT * WHERE { <${term.value}> <${RDFS}label> ?o }`
  );
}

async function generateType(context: IQueryContext, type: Term) {
  const properties = await getProperties(context, type);
  for (const property of properties) {
    // console.log(
    //   property,
    //   await getRangeInfo(context, property),
    //   camelize((await getLabelInfo(context, property))[0].value)
    // );
    // new GraphQLAbstractType
    // const directive = new GraphQLDirective({
    //   name: 'property',
    //   // args: new GraephQL
    // })
  }
  // print(
  //   new GraphQLDirective({
  //     name: 'property',
  //     args: {
  //       iri: p
  //     }
  //   })
  // )
  // const r = await context.sparqlEngine.queryBindings(`SELECT * WHERE { <${properties[1].value}> ?p ?o }`, context.context)
  // r.on('data', (data: Bindings) => {
  //   console.log(data.get('p'), data.get('o'))
  // })
}

// From https://stackoverflow.com/questions/2970525/converting-any-string-into-camel-case
function camelize(str: string) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
      index === 0 ? word.toLowerCase() : word.toUpperCase()
    )
    .replace(/\s+|_/g, "");
}

const FOAF =
  "https://web.archive.org/web/20220614105937if_/http://xmlns.com/foaf/spec/20140114.rdf";
const Person = DF.namedNode("http://xmlns.com/foaf/0.1/Person");

const context: IQueryContext = {
  sparqlEngine: new QueryEngine(),
  context: {
    sources: [FOAF],
  },
};

generateType(context, Person).catch(() => {
  // Ignore error
});
