import { https } from 'follow-redirects';

function breakIndex(value: string) {
  // Find the index of the last '#' or '/' if no '#' exists
  const hashIndex = value.lastIndexOf('#');
  return (hashIndex === -1 ? value.lastIndexOf('/') : hashIndex);
}

async function getPrefix(lookup: string): Promise<string> {
  return new Promise((res, rej) => {
    https.get(`https://prefix.cc/reverse?uri=${lookup}`, response => {
      const data = response.responseUrl;
      res(data.slice(data.lastIndexOf('/') + 1));
    }).on('error', rej)
  });

  // console.log('looking up', namespace)
  // const res = await (await fetch(`https://prefix.cc/reverse?uri=${namespace}/&format=jsonld`)).json();
  // return Object.keys(res['@context'])[0];

  // This breaks several URIs including
  //   catching http://www.w3.org/2003/01/geo/wgs84_pos
  // SyntaxError: Unexpected token < in JSON at position 0
  //     at JSON.parse (<anonymous>)
  //     at Response.json (node:internal/deps/undici/undici:2303:23)
  //     at processTicksAndRejections (node:internal/process/task_queues:95:5)
  // catching http://www.w3.org/2000/01/rdf-schema
  // catching http://www.w3.org/2002/07/owl
  // const namespace = lookup.slice(0, breakIndex(lookup));
  // console.log('looking up', namespace)
  // const res = await (await fetch(`https://prefix.cc/reverse?uri=${namespace}/&format=jsonld`)).json();
  // return Object.keys(res['@context'])[0];
}

export function prefixFactory() {
  const cache: Record<string, string | undefined> = {};
  const request: Record<string, Promise<string> | undefined> = {};

  return (lookup: string): string | Promise<string> => {
    const namespace = lookup.slice(0, breakIndex(lookup));

    if (cache[namespace]) {
      return cache[namespace]!;
    }

    if (!request[namespace]) {
      request[namespace] = getPrefix(namespace);
      request[namespace]!.then(res => {
        cache[namespace] = res;
        return res;
      }).catch(() => {
        console.log('catching', namespace,)
        delete request[namespace];
      })
    }

    return request[namespace]!;
  }
}
