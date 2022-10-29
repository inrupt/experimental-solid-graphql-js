import { GetMeshSourcePayload, MeshHandler } from '@graphql-mesh/types';
import { createGraphql } from './run';
import { getOntologyData } from './run_first';

interface OntologyHandlerOptions {
  config: {
    source: string | [string, ...string[]];
  }
}

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
