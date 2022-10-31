import { GetMeshSourcePayload, MeshHandler } from '@graphql-mesh/types';
import { GraphQLSchema } from 'graphql';
import { QueryEngine } from '@comunica/query-sparql-file';
import { queryObject, queryObjects } from '@inrupt/sparql-utils';
import { Term } from '@rdfjs/types';
import { DataFactory as DF } from 'n3';

interface SHACLHandlerOptions {
  config: {
    source: string | [string, ...string[]];
    // When shapes are not defined we just collect all the shapes
    // defined as sh:nodeShapes in the source
    // TODO: Implement this fallback behavior
    shapes?: Term[];
  }
}

// TODO: Test with
// - source: https://shacl.org/playground/shacl.ttl
// - shape: http://schema.org/PersonShape

// TODO: Use sh:

const SH = 'http://www.w3.org/ns/shacl#';

// TODO: Re-write this code once we are able to generate a schema using the shacl-shacl ontology
export default class SHACLHandler implements MeshHandler {
  private readonly sources: [string, ...string[]];
  private readonly shapes?: Term[];

  constructor({ config: { source, shapes } }: SHACLHandlerOptions) {
    this.sources = typeof source === 'string' ? [ source ] : source;
    this.shapes = shapes;
  }
  
  async getMeshSource(payload: GetMeshSourcePayload) {
    const config = {
      sparqlEngine: new QueryEngine(),
      context: {
        sources: this.sources
      }
    }


    if (!this.shapes) {
      throw new Error('Not implemented - shape discovery');
    }

    // TODO: Refactor this so we can do it concurrently
    for (const shape of this.shapes) {
      // TODO: Handle other targets
      const targetClass = await queryObjects(config, shape, DF.namedNode(`${SH}targetClass`));


      const properties = await queryObjects(config, shape, DF.namedNode(`${SH}property`));

      for (const property of properties) {
        // TODO: add support for paths that are not just a single property
        const path = await queryObjects(config, property, DF.namedNode(`${SH}path`));
        const datatype = await queryObject(config, property, DF.namedNode(`${SH}datatype`));
        const nodeKind = await queryObject(config, property, DF.namedNode(`${SH}nodeKind`));
        const clss = await queryObject(config, property, DF.namedNode(`${SH}class`));
        const name = await queryObjects(config, property, DF.namedNode(`${SH}name`));
        const maxCount = await queryObjects(config, property, DF.namedNode(`${SH}maxCount`));
        const minCount = await queryObjects(config, property, DF.namedNode(`${SH}minCount`));
        
        // TODO: Handle logical constraints (sh:or, sh:and)
      }
    }



    return {
      schema: new GraphQLSchema({
        types: [],
      })
    }
  }
}
