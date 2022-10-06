import type { Algebra } from 'sparqlalgebrajs';
import type { AlgebraSparqlQueryable, BindingsResultSupport, BooleanResultSupport, QueryContext } from '@rdfjs/types';

export type ISparqlEngine = AlgebraSparqlQueryable<Algebra.Project | Algebra.Ask, BindingsResultSupport & BooleanResultSupport>;

export interface IQueryContext {
  sparqlEngine: ISparqlEngine;
  context?: QueryContext | undefined;
}
