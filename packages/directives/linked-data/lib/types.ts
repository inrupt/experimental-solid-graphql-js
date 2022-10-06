import { Term } from '@rdfjs/types';

// TODO create fieldConfig type
// TODO: Move this to more generic package
export interface Source {
  __node?: Promise<Term>;
  [argName: string]: any;
}
