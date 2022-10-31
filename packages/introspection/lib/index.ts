import { GetMeshSourcePayload, MeshHandler } from '@graphql-mesh/types';
import { createGraphql } from './run';
import { getOntologyData } from './run_first';

interface OntologyHandlerOptions {
  config: {
    source: string | [string, ...string[]];
  }
}

// TODO: See if graphql should be peer dep
// TODO: Add parameters to enable customisations
// where we can do things like
// - treat an RDFS list as an actual list
// 

export default class OntologyHandler implements MeshHandler {
  private sources: [string, ...string[]];

  constructor({ config: { source } }: OntologyHandlerOptions) {
    this.sources = typeof source === 'string' ? [ source ] : source;
  }
  
  async getMeshSource(payload: GetMeshSourcePayload) {
    const data = await getOntologyData(this.sources);

    return {
      schema: createGraphql(data),
    }
  }
}
