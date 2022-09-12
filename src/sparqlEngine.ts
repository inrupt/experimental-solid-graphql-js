
import { IQueryEngine as ComunicaQueryEngine, BindingsStream } from '@comunica/types';
import { Client, IQueryEngine } from "graphql-ld";
import { Algebra, Factory } from "sparqlalgebrajs";
import stringifyStream from 'stream-to-string';
import * as RDF from '@rdfjs/types';
import { type AsyncIterator, wrap } from 'asynciterator'
import { DataFactory as DF } from 'n3';
import { ResultStream } from '@rdfjs/types';

export class SparqlEngine {
  private readonly factory = new Factory();
  constructor(private readonly sparqlEngineBase: RDF.AlgebraSparqlQueryable<Algebra.Project, RDF.BindingsResultSupport>) {

  }

  public queryBindings(query: Algebra.Project): Promise<ResultStream<RDF.Bindings>> {
    return this.sparqlEngineBase.queryBindings(query);
  }

  /**
   * Returns the binding if there is exactly one result.
   * Errors otherwise.
   */
  public async queryBinding(query: Algebra.Project): Promise<RDF.Bindings> {
    return getSingle(wrap(await this.queryBindings(query)));
  }

  /**
   * Returns the binding if there is exactly one result and one term/variable in that result.
   * Errors otherwise.
   */
  public async queryTerm(query: Algebra.Project): Promise<RDF.Term> {
    return getSingleBinding(await this.queryBinding(query));
  }

  private objectAlgebra(subject: RDF.Term, predicate: RDF.Term): Algebra.Project {
    const object = DF.variable('o');
    const pattern = this.factory.createPattern(subject, predicate, object);
    return this.factory.createProject(pattern, [object]);
  }

  public async queryObject(subject: RDF.Term, predicate: RDF.Term): Promise<RDF.Term> {
    return this.queryTerm(this.objectAlgebra(subject, predicate));
  }

  public async queryObjects(subject: RDF.Term, predicate: RDF.Term): Promise<AsyncIterator<RDF.Term>> {
    return this.queryTerms(this.objectAlgebra(subject, predicate));
  }

  /**
   * Returns the terms of a query with a single variable.
   * The stream will error if there are any bindings without a single result.
   */
  public async queryTerms(query: Algebra.Project): Promise<AsyncIterator<RDF.Term>> {
    const bindings = wrap(await this.queryBindings(query));

    // TODO: Clean this up
    return bindings.map(result => getSingleBinding(result));
  }
}

function getSingleBinding(bindings: RDF.Bindings): RDF.Term {
  if (bindings.size !== 1) {
    throw new Error(`Expected 1 term in bindings, received ${bindings.size}`);
  }

  for (const value of bindings.values())
    return value;

  throw new Error(`Expected 1 term in bindings, received 0`);
}

async function getSingle<T>(it: AsyncIterator<T>): Promise<T> {
  return new Promise((res, rej) => {
    let item: T | null = null
    let itemTemp: T | null = null;

    function onReadable() {
      if ((itemTemp = it.read()) !== null) {
        if (item !== null) {
          item = itemTemp;
        } else {
          err(new Error("More than one element in iterator"));
          return;
        }
      }

      if (it.done) {
        cleanup();
        if (item !== null) {
          res(item);
        } else {
          rej(new Error("No elements in iterator"));
        }
      }
    }

    function err(e: Error) {
      cleanup();
      rej(e);
    }

    function cleanup() {
      it.removeListener('readable', onReadable);
      it.removeListener('end', onReadable);
      it.removeListener('error', err);
      // TODO: Double check this
      it.destroy();
    }

    it.on('readable', onReadable);
    it.on('end', onReadable);
    it.on('error', err);

    onReadable();
  });
}