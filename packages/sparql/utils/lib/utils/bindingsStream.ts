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
import type { ResultStream, Bindings, Term } from "@rdfjs/types";
import { getSingleBinding } from "./bindings";
import { getSingleResultFromStream } from "./stream";

/**
 * Returns the binding if there is exactly one result and one term/variable in that result.
 * Errors otherwise.
 */

export function getSingleTermFromBindingsStream(
  stream: ResultStream<Bindings>,
  params?: { optional?: false }
): Promise<Term>;
export function getSingleTermFromBindingsStream(
  stream: ResultStream<Bindings>,
  params?: { optional?: boolean }
): Promise<Term | null>;
export async function getSingleTermFromBindingsStream(
  stream: ResultStream<Bindings>,
  params?: { optional?: boolean }
): Promise<Term | null> {
  const result = await getSingleResultFromStream<Bindings>(stream, params);

  if (result === null) {
    return null;
  }

  return getSingleBinding(result);
}
