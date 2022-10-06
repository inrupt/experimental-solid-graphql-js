import type { ResultStream } from '@rdfjs/types';

/**
 * Destroys a stream if it has a destroy method
 * @param stream A data stream
 */
function destroyStream(stream: any) {
  if ('destroy' in stream && typeof stream.destroy === 'function') {
    stream.destroy();
  }
}

/**
 * If a stream contains exactly one element, return that element
 * error otherwise.
 * 
 * If optional is enabled then the function may return null
 */
export function getSingleResultFromStream<T>(stream: ResultStream<T>, params?: { optional?: false }): Promise<T>;
export function getSingleResultFromStream<T>(stream: ResultStream<T>, params?: { optional?: boolean }): Promise<T | null>
export function getSingleResultFromStream<T>(stream: ResultStream<T>, params?: { optional?: boolean }): Promise<T | null> {
  return new Promise<T | null>((res, rej) => {
    let item: T | null = null;

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

    function cleanup(destroy?: boolean) {
      stream.off('data', onData);
      stream.off('end', onEnd);
      stream.off('error', onError);
      if (destroy) {
        destroyStream(stream)
      }
    }

    stream.on('data', onData);
    stream.on('end', onEnd);
    stream.on('error', onError);
  });
}
