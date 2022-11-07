// import { QueryEngine } from '@inrupt/query-sparql-reasoning-solid';
// import { QueryEngine } from '@comunica/query-sparql';
// TODO: Use reasoning and link traversal
import { QueryEngine } from "@comunica/query-sparql-solid";
import { createContext } from "react";
import { IQueryContext } from "@inrupt/sparql-utils";
// import { QueryEngine } from '@comunica/query-sparql-link-traversal-solid';

export const EngineContext = createContext({
  engine: new QueryEngine(),
});

// TODO: Fix this
export const QueryContext = createContext<IQueryContext | undefined>(undefined);
