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
import type { Algebra } from "sparqlalgebrajs";
import type { ResultStream, Bindings, Term } from "@rdfjs/types";
import { wrap } from "asynciterator";
import type { IQueryContext } from "../types";
import { getSingleTermFromBindingsStream } from "./bindingsStream";
import { getSingleBinding } from "./bindings";

/**
 * Returns the bindings stream of results for a query
 */
export function queryBindings(
  context: IQueryContext,
  query: Algebra.Project
): Promise<ResultStream<Bindings>> {
  return context.sparqlEngine.queryBindings(query, context.context);
}

/**
 * Returns the boolean result for a query
 */
export function queryBoolean(
  context: IQueryContext,
  query: Algebra.Ask
): Promise<boolean> {
  return context.sparqlEngine.queryBoolean(query, context.context);
}

/**
 * Returns the result of a query which is expected to have exactly
 * one set of bindings containing one term.
 *
 * @param params.optional [default=false] If the term is optional and undefined may be returned
 */
export async function queryTerm(
  context: IQueryContext,
  query: Algebra.Project,
  params?: { optional?: false }
): Promise<Term>;
export async function queryTerm(
  context: IQueryContext,
  query: Algebra.Project,
  params?: { optional?: boolean }
): Promise<Term | null>;
export async function queryTerm(
  context: IQueryContext,
  query: Algebra.Project,
  params?: { optional?: boolean }
): Promise<Term | null> {
  return getSingleTermFromBindingsStream(
    await queryBindings(context, query),
    params
  );
}

/**
 * Returns the terms of a query with a single variable.
 * The function will error if there are any bindings without a single result.
 */
export async function queryTerms(
  context: IQueryContext,
  query: Algebra.Project
): Promise<Term[]> {
  return wrap(await queryBindings(context, query))
    .map((r) => getSingleBinding(r))
    .toArray();
}
