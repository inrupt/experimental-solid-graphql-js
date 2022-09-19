import { Algebra } from 'sparqlalgebrajs';
import * as RDF from '@rdfjs/types';

export type ISparqlEngine = RDF.AlgebraSparqlQueryable<Algebra.Project | Algebra.Ask, RDF.BindingsResultSupport & RDF.BooleanResultSupport>;

export interface IContext {
  sparqlEngine: ISparqlEngine;
  context?: RDF.QueryContext | undefined;
}

export type OperationVariables = Record<string, any>;
