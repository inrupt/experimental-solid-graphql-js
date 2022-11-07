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
import type { Term } from "@rdfjs/types";
import type { IQueryContext } from "./types";
import {
  queryTerm,
  labelPattern,
  objectPattern,
  queryTerms,
  askType,
  queryBoolean,
} from "./utils";

type MaybePromise<T> = T | Promise<T>;

/**
 * Get the object of a given subject-predicate pattern
 */
export async function queryObject(
  context: IQueryContext,
  subject: MaybePromise<Term>,
  predicate: MaybePromise<Term>
): Promise<Term> {
  return queryTerm(
    context,
    objectPattern(await subject, await predicate, true)
  ).catch(async (err: Error) => {
    throw new Error(
      `Error when retrieving single object in pattern ${
        (await subject).value
      } ${(await predicate).value} ?o: (${err.message})`
    );
  });
}

/**
 * Get the objects of a given subject-predicate pattern
 */
export async function queryObjects(
  context: IQueryContext,
  subject: MaybePromise<Term>,
  predicate: MaybePromise<Term>
): Promise<Term[]> {
  return queryTerms(
    context,
    objectPattern(await subject, await predicate, true)
  ).catch(async (err: Error) => {
    throw new Error(
      `Error when retrieving objects in pattern ${(await subject).value} ${
        (await predicate).value
      } ?o: (${err.message})`
    );
  });
}

/**
 * Get the label of a given subject
 */
export async function queryLabel(
  context: IQueryContext,
  subject: MaybePromise<Term>
): Promise<Term> {
  return queryTerm(context, labelPattern(await subject, true));
}

/**
 * Checks if the subject is of a given type
 */
export async function isType(
  context: IQueryContext,
  subject: MaybePromise<Term>,
  type: MaybePromise<Term>
): Promise<boolean> {
  return queryBoolean(context, askType(await subject, await type));
}
