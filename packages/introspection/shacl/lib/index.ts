import { GetMeshSourcePayload, MeshHandler } from '@graphql-mesh/types';
import { GraphQLList, GraphQLNonNull, GraphQLSchema } from 'graphql';
import { QueryEngine } from '@comunica/query-sparql-file';
import { queryObject, queryObjects } from '@inrupt/sparql-utils';
import { Term } from '@rdfjs/types';
import { DataFactory as DF } from 'n3';
import { GraphQLType } from 'graphql';

// Work out how to modify the fields based on the min/max count
function modifier(type: GraphQLType, minCount: number = 0, maxCount: number = Infinity) {
  if (maxCount < 1) {
    throw new Error('Field should not exist for maxCount less than 1');
  }
  if (maxCount > 1) {
    return new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(type)))
  }

  // Now we know the maxCount is exactly 1

  if (minCount === 1) {
    return new GraphQLNonNull(type);
  }

  if (minCount === 0) {
    return type;
  }

  throw new Error(`Invalid SHACL constraint - received minCount: ${minCount} and maxCount: ${maxCount}`)
}

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

// TODO: Use non-validating constraint to format output
// TODO: Use directives to capture contraints that SHACL can capture but GraphQL cannot
// TODO: Perform custom list handling

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
