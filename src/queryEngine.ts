// Based on https://github.com/rubensworks/GraphQL-LD-Comunica.js

import { IQueryEngine as ComunicaQueryEngine } from '@comunica/types';
import { Client, IQueryEngine } from "graphql-ld";
import { Algebra } from "sparqlalgebrajs";
import stringifyStream from 'stream-to-string';

class GraphQLEngine implements IQueryEngine {
  constructor(private readonly comunicaEngine: ComunicaQueryEngine) {

  }

  public async query(query: Algebra.Operation): Promise<any> {
    const { data } = await this.comunicaEngine.resultToString(
      await this.comunicaEngine.query(query),
      'application/sparql-results+json',
    );
    return JSON.parse(await stringifyStream(data));
  }
}

// Create a GraphQL-LD client based on a client-side Comunica engine over 2 sources
const comunicaConfig = {
  sources: [ "http://dbpedia.org/sparql", "https://ruben.verborgh.org/profile/" ],
};
const client = new Client({ context, queryEngine: new QueryEngineComunica(comunicaConfig) });



// // Define a query
// const query = `
//   query @single {
//     label
//   }`;

// // Execute the query
// const { data } = await client.query({ query });
