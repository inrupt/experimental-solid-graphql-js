import type {
  IQueryContext
} from './types';
import {
  Term
} from '@rdfjs/types';
import {
  queryTerm,
  labelPattern,
  objectPattern,
  queryTerms,
  askType,
  queryBoolean,
} from './utils';

type MaybePromise<T> = T | Promise<T>;

/**
 * Get the object of a given subject-predicate pattern
 */
export async function queryObject(context: IQueryContext, subject: MaybePromise<Term>, predicate: MaybePromise<Term>): Promise<Term> {
  return queryTerm(context, objectPattern(await subject, await predicate));
}

/**
 * Get the objects of a given subject-predicate pattern
 */
 export async function queryObjects(context: IQueryContext, subject: MaybePromise<Term>, predicate: MaybePromise<Term>): Promise<Term[]> {
  return queryTerms(context, objectPattern(await subject, await predicate));
}

/**
 * Get the label of a given subject
 */
export async function queryLabel(context: IQueryContext, subject: MaybePromise<Term>): Promise<Term> {
  return queryTerm(context, labelPattern(await subject));
}

/**
 * Checks if the subject is of a given type
 */
export async function isType(context: IQueryContext, subject: MaybePromise<Term>, type: MaybePromise<Term>): Promise<boolean> {
  return queryBoolean(context, askType(await subject, await type))
}
