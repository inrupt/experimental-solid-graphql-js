import { Bindings, BindingsResultSupport, QueryContext, StringSparqlQueryable, Term } from '@rdfjs/types';
import { wrap } from 'asynciterator';

export interface IQueryContext<C extends QueryContext = QueryContext> {
  sparqlEngine: StringSparqlQueryable<BindingsResultSupport>;
  context: C;
}

const RDFS = 'http://www.w3.org/2000/01/rdf-schema#';

/**
 * Gets a single term out of a set of bindings with size 1
 * @param bindings Result of a SPARQL Query
 * @returns The single term in the Bindings
 */
function getSingleBinding(bindings: Bindings): Term {
  if (bindings.size !== 1) {
    throw new Error(`Expected 1 term in bindings, received ${bindings.size}`);
  }

  for (const value of bindings.values())
    return value;

  throw new Error(`Expected 1 term in bindings, received 0`);
}

async function runQuery(context: IQueryContext, query: string) {
  return wrap(context.sparqlEngine.queryBindings(query, context.context))
    .map(binding => getSingleBinding(binding))
    .toArray();
}

export function getProperties(context: IQueryContext, type: Term) {
  if (type.termType !== 'NamedNode') {
    throw new Error('Expected NamedNode')
  }

  return runQuery(context, `SELECT * WHERE { ?s <${RDFS}domain> <${type.value}> }`);
}

// Note this should be the same as getProperties if owl2rl inference is enabled
export function getAllProperties(context: IQueryContext, type: Term) {
  if (type.termType !== 'NamedNode') {
    throw new Error('Expected NamedNode')
  }

  return runQuery(context, `SELECT DISTINCT ?s WHERE { 
    <${type.value}> <${RDFS}subClassOf>*/^<${RDFS}domain> ?s
  }`);

  // return runQuery(context, `SELECT DISTINCT ?s WHERE { 
  //   {
  //     <${type.value}> <${RDFS}subClassOf>+ ?class . ?s <${RDFS}domain> ?class
  //   }
  //   UNION
  //   {
  //     ?s <${RDFS}domain> <${type.value}>
  //   }
  // }`);
}


export async function getRangeInfo(context: IQueryContext, term: Term) {
  return runQuery(context, `SELECT * WHERE { <${term.value}> <${RDFS}range> ?o }`)
}


export async function getLabelInfo(context: IQueryContext, term: Term) {
  return runQuery(context, `SELECT * WHERE { <${term.value}> <${RDFS}label> ?o }`)
}

export async function getCommentInfo(context: IQueryContext, term: Term) {
  return runQuery(context, `SELECT * WHERE { <${term.value}> <${RDFS}comment> ?o }`)
}

export async function getOwlClasses(context: IQueryContext) {
  return runQuery(context, `SELECT * WHERE { ?s a <http://www.w3.org/2002/07/owl#Class> }`)
}

// This function traverses to all classes that we will need to define in the schema
export async function predictAllClasses(context: IQueryContext, type: Term) {
  return runQuery(context, `SELECT DISTINCT ?type WHERE { 
    <${type.value}> (<${RDFS}subClassOf>*/^<${RDFS}domain>/<${RDFS}range>)* ?type
  }
  
  ORDER BY (?type)
  
  `);
}
