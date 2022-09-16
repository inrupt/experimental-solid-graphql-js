import { QueryEngine } from "@comunica/query-sparql";
import { store } from './store';

export const context = { 
  sparqlEngine: new QueryEngine(),
  context: {
    sources: [ 
      store
    ]
  }
}
