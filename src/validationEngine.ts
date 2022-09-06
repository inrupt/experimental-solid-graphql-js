// This is for prototyping stage only since
// it requires us to load all of the data
// from the endpoint before we start validating the data

import SHACLValidate from 'rdf-validate-shacl';
import { IQueryEngine } from '@comunica/types';
import { Quad_Subject } from '@rdfjs/types';
import { Store, DataFactory as DF } from 'n3';
import { promisifyEventEmitter } from 'event-emitter-promisify';
import { Factory } from 'sparqlalgebrajs';

interface EngineNode {
  engine: IQueryEngine;
  focusNode: Quad_Subject;
}

interface ValidationOptions {
  shape: EngineNode;
  data: EngineNode;
}

const factory = new Factory();
const pattern = factory.createPattern(DF.variable('?s'), DF.variable('?p'), DF.variable('?o'));

const allQuads = factory.createConstruct(
  pattern,
  [
    pattern
  ]
)

async function allStream(engine: IQueryEngine) {
  const store = new Store();
  return promisifyEventEmitter(
    store.import(
      await engine.queryQuads(allQuads)
    ),
    store
  );
}

async function validate(engine: ValidationOptions) {
  const validator = new SHACLValidate(
    await allStream(engine.shape.engine)
  );

  // TODO: Work out how to reference the data, dataset
  return validator.nodeConformsToShape(
    engine.data.focusNode,
    engine.shape.focusNode,
  );
}
