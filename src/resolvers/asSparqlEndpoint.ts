import * as RDF from '@rdfjs/types';
import { Algebra } from 'sparqlalgebrajs';
import { ISparqlEngine } from './types';

export function getEngineFromContext(context: any): ISparqlEngine {
  if (typeof context !== 'object') {
    throw new Error(`Expected context to be object, received ${typeof context}`)
  }

  if (!('sparqlEngine' in context)) {
    throw new Error('sparqlEngine key not found in context');
  }

  return asEngine(context.sparqlEngine);
}

export function asEngine<T>(engine: T): T & ISparqlEngine {
  return asBindingsEngine(asBooleanEngine(engine));
}

export function asBindingsEngine<T>(engine: T): T & RDF.AlgebraSparqlQueryable<Algebra.Project, RDF.BindingsResultSupport> {
  if (!isSparqlBindingsEngine(engine)) {
    throw new Error('Engine does not support SPARQL bindings');
  }

  return engine;
}

export function asBooleanEngine<T>(engine: T): T & RDF.AlgebraSparqlQueryable<Algebra.Ask, RDF.BooleanResultSupport> {
  if (!isSparqlBooleanEngine(engine)) {
    throw new Error('Engine does not support SPARQL boolean result');
  }

  return engine;
}

export function isSparqlBindingsEngine(engine: any): engine is RDF.AlgebraSparqlQueryable<Algebra.Project, RDF.BindingsResultSupport> {
  return typeof engine === 'object'
    && 'queryBindings' in engine
    && typeof engine.queryBindings === 'function'
    && engine.queryBindings.length === 2
}


export function isSparqlBooleanEngine(engine: any): engine is RDF.AlgebraSparqlQueryable<Algebra.Ask, RDF.BooleanResultSupport> {
  return typeof engine === 'object'
    && 'queryBoolean' in engine
    && typeof engine.queryBoolean === 'function'
    && engine.queryBoolean.length === 2
}
