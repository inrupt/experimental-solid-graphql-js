import type { ResultStream, Bindings, Term } from '@rdfjs/types';
import { getSingleBinding } from './bindings';
import { getSingleResultFromStream } from './stream';

/**
 * Returns the binding if there is exactly one result and one term/variable in that result.
 * Errors otherwise.
 */

export function getSingleTermFromBindingsStream(stream: ResultStream<Bindings>, params?: { optional?: false }): Promise<Term>;
export function getSingleTermFromBindingsStream(stream: ResultStream<Bindings>, params?: { optional?: boolean }): Promise<Term | null>
export async function getSingleTermFromBindingsStream(stream: ResultStream<Bindings>, params?: { optional?: boolean }): Promise<Term | null> {
  const result = await getSingleResultFromStream<Bindings>(stream, params);

  if (result === null) {
    return null;
  }
  
  return getSingleBinding(result);
}
