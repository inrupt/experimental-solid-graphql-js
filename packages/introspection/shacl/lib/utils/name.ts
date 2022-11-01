import { https } from "follow-redirects";
import { Term } from "n3";
import { getLabelInfo, IQueryContext } from "./rdf";
import { camelize } from "./string";

// TODO: Remove duplication with ontology generation

export async function label(context: IQueryContext, term: Term) {
  const value = (await getLabelInfo(context, term))[0]?.value;
  return value ? camelize(value) : undefined;
}

// TODO: Fix errors here like escaping
export function getFragment({ value }: Term) {
  const args: number[] = [];

  if (value.lastIndexOf("/") > 0) {
    args.push(value.lastIndexOf("/"));
  }

  if (value.lastIndexOf("#") > 0) {
    args.push(value.lastIndexOf("#"));
  }

  const i = Math.max(...args);

  return value.slice(i + 1);
}

async function fragment(context: IQueryContext, term: Term) {
  const value = getFragment(term);
  return value ? camelize(value) : undefined;
}

// Reserved keys
const reserved: Record<string, boolean | undefined> = {
  id: true
}

export async function getUniqueName(context: IQueryContext, term: Term, names: Record<string, string>, prefix = '') {
  let value: string | undefined;
  let i = -1;

  function realVal() {
    return prefix + value + (i === 0 ? '' : i);
  }

  function clear() {
    if (value && (reserved[realVal()] || realVal() in names)) {
      value = undefined;
    }
  }

  while (!value) {
    i += 1;
    value = await label(context, term);
    clear();
    value ??= await fragment(context, term);
    clear();
  }

  return realVal();
}

export function breakIndex(value: string) {
  // Find the index of the last '#' or '/' if no '#' exists
  const hashIndex = value.lastIndexOf('#');
  return (hashIndex === -1 ? value.lastIndexOf('/') : hashIndex);
}



export async function getPrefix(lookup: string): Promise<string> {
  return new Promise((res, rej) => {
    https.get(`https://prefix.cc/reverse?uri=${lookup}`, response => {
      const data = response.responseUrl;
      res(data.slice(data.lastIndexOf('/') + 1));
    }).on('error', rej)
  });
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

export async function createNames(context: IQueryContext, classes: Term[], baseTerms: string[], noPrefix = false) {
  const getPrefix = prefixFactory();

  async function getCleanPrefix(c: Term) {
    const p = await getPrefix(c.value);
    return `${camelize(p.split(':')[0])}`
  }

  // First we need to create the
  const names: Record<string, string> = {};

  for (const c of classes) {
    const n = await getUniqueName(context, c, names, (baseTerms.includes(c.value) || noPrefix) ? '' : await getCleanPrefix(c));
    names[n] = c.value;
  }

  return names;
}