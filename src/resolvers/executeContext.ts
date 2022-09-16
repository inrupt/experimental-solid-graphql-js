import { Algebra, Factory } from 'sparqlalgebrajs';
import * as RDF from '@rdfjs/types';
import arrayify from 'arrayify-stream';
import { DataFactory as DF } from 'n3';
import { wrap, type AsyncIterator } from 'asynciterator';
import { IContext } from './types';
const factory = new Factory();

const _RDF = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
const RDFS = "http://www.w3.org/2000/01/rdf-schema#";

const RDF_TYPE = `${_RDF}type`;
const RDFS_LABEL = `${RDFS}label`;

function queryBindings(context: IContext, query: Algebra.Project) {
  return context.sparqlEngine.queryBindings(query, context.context);
}

function queryBoolean(context: IContext, query: Algebra.Ask) {
  return context.sparqlEngine.queryBoolean(query, context.context);
}

/**
 * Returns the binding if there is exactly one result.
 * Errors otherwise.
 */
async function queryBinding(context: IContext, query: Algebra.Project): Promise<RDF.Bindings> {
  const bindings = await arrayify<RDF.Bindings>(await queryBindings(context, query));

  if (bindings.length !== 1) {
    throw new Error("More than one element in iterator")
  }

  return bindings[0];
}

/**
 * Returns the binding if there is exactly one result and one term/variable in that result.
 * Errors otherwise.
 */
async function queryTerm(context: IContext, query: Algebra.Project): Promise<RDF.Term> {
  return getSingleBinding(await queryBinding(context, query));
}

function objectAlgebra(subject: RDF.Term, predicate: RDF.Term): Algebra.Project {
  const object = DF.variable('o');
  const pattern = factory.createPattern(subject, predicate, object);
  return factory.createProject(pattern, [object]);
}

function askPatternAlgebra(subject: RDF.Term, predicate: RDF.Term, object: RDF.Term): Algebra.Ask {
  return factory.createAsk(factory.createPattern(subject, predicate, object));
}

function askClassAlgebra(subject: RDF.Term, clss: RDF.Term): Algebra.Ask {
  return askPatternAlgebra(subject, DF.namedNode(RDF_TYPE), clss);
}

export function queryObject(context: IContext, subject: RDF.Term, predicate: RDF.Term): Promise<RDF.Term> {
  return queryTerm(context, objectAlgebra(subject, predicate));
}

export function queryLabel(context: IContext, subject: RDF.Term): Promise<RDF.Term> {
  return queryObject(context, subject, DF.namedNode(RDFS_LABEL));
}

export function queryObjects(context: IContext, subject: RDF.Term, predicate: RDF.Term): Promise<AsyncIterator<RDF.Term>> {
  return queryTerms(context, objectAlgebra(subject, predicate));
}

/**
 * Returns the terms of a query with a single variable.
 * The stream will error if there are any bindings without a single result.
 */
export async function queryTerms(context: IContext, query: Algebra.Project): Promise<AsyncIterator<RDF.Term>> {
  const bindings = wrap(await queryBindings(context, query));

  // TODO: Clean this up
  return bindings.map(result => getSingleBinding(result));
}

// Checks if a subject belongs to a particular class
export function askClass(context: IContext, subject: RDF.Term, clss: RDF.Term): Promise<boolean> {
  return queryBoolean(context, askClassAlgebra(subject, clss));
}

function getSingleBinding(bindings: RDF.Bindings): RDF.Term {
  if (bindings.size !== 1) {
    throw new Error(`Expected 1 term in bindings, received ${bindings.size}`);
  }

  for (const value of bindings.values())
    return value;

  throw new Error(`Expected 1 term in bindings, received 0`);
}
