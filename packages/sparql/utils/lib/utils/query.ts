import type { Algebra } from 'sparqlalgebrajs';
import type { IQueryContext } from '../types';
import type { ResultStream, Bindings, Term } from '@rdfjs/types';
import { getSingleTermFromBindingsStream } from './bindingsStream';
import { wrap } from 'asynciterator';
import { getSingleBinding } from './bindings';

/**
 * Returns the bindings stream of results for a query
 */
export function queryBindings(context: IQueryContext, query: Algebra.Project): Promise<ResultStream<Bindings>> {
  return context.sparqlEngine.queryBindings(query, context.context);
}

/**
 * Returns the boolean result for a query
 */
 export function queryBoolean(context: IQueryContext, query: Algebra.Ask): Promise<boolean> {
  return context.sparqlEngine.queryBoolean(query, context.context);
}

/**
 * Returns the result of a query which is expected to have exactly
 * one set of bindings containing one term.
 * 
 * @param params.optional [default=false] If the term is optional and undefined may be returned
 */
export async function queryTerm(context: IQueryContext, query: Algebra.Project, params?: { optional?: false }): Promise<Term>
export async function queryTerm(context: IQueryContext, query: Algebra.Project, params?: { optional?: boolean }): Promise<Term | null>
export async function queryTerm(context: IQueryContext, query: Algebra.Project, params?: { optional?: boolean }): Promise<Term | null> {
  return getSingleTermFromBindingsStream(await queryBindings(context, query), params);
}

/**
 * Returns the terms of a query with a single variable.
 * The function will error if there are any bindings without a single result.
 */
export async function queryTerms(context: IQueryContext, query: Algebra.Project): Promise<Term[]> {
  return wrap(await queryBindings(context, query))
    .map(r => getSingleBinding(r))
    .toArray();
}
