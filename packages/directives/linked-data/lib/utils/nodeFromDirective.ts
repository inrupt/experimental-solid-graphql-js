
import { DataFactory } from "n3";

export function nodeFromDirective(directive: Record<string, any> | undefined, directiveName: string) {
  if (!directive) {
    throw new Error(`@${directiveName} requires exactly one argument, received 0`);
  }

  const entries = Object.entries(directive);

  if (entries.length !== 1) {
    throw new Error(`@${directiveName} requires exactly one argument, received ${entries.length}`);
  }

  const [[key, value]] = entries;

  if (typeof value !== 'string') {
    throw new Error(`@${directiveName} accepts only string values, received ${typeof value}`);
  }

  const mapping = {
    iri: DataFactory.namedNode
  }

  if (key in mapping) {
    return mapping[key as 'iri'](value);
  }

  throw new Error(`Expected key to be one of ${Object.keys(mapping).join(', ')}; received ${key}`);
}