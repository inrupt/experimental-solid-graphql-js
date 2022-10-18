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
import type { ResultStream } from "@rdfjs/types";

/**
 * Destroys a stream if it has a destroy method
 * @param stream A data stream
 */
function destroyStream(stream: any) {
  if ("destroy" in stream && typeof stream.destroy === "function") {
    stream.destroy();
  }
}

/**
 * If a stream contains exactly one element, return that element
 * error otherwise.
 *
 * If optional is enabled then the function may return null
 */
export function getSingleResultFromStream<T>(
  stream: ResultStream<T>,
  params?: { optional?: false }
): Promise<T>;
export function getSingleResultFromStream<T>(
  stream: ResultStream<T>,
  params?: { optional?: boolean }
): Promise<T | null>;
export function getSingleResultFromStream<T>(
  stream: ResultStream<T>,
  params?: { optional?: boolean }
): Promise<T | null> {
  return new Promise<T | null>((res, rej) => {
    let item: T | null = null;

    function cleanup(destroy?: boolean) {
      stream.off("data", onData);
      stream.off("end", onEnd);
      stream.off("error", onError);
      if (destroy) {
        destroyStream(stream);
      }
    }

    function onData(elem: T) {
      if (item === null) {
        item = elem;
      } else {
        cleanup(true);
        rej(new Error("More than one element in iterator"));
      }
    }

    function onEnd() {
      cleanup();
      if (item === null && params?.optional !== true) {
        rej(new Error("Empty iterator"));
      } else {
        res(item);
      }
    }

    function onError(err: any) {
      cleanup();
      rej(err);
    }

    stream.on("data", onData);
    stream.on("end", onEnd);
    stream.on("error", onError);
  });
}
