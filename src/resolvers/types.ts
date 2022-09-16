import * as RDF from '@rdfjs/types';
import { GraphQLFieldConfig } from 'graphql';
import { Algebra } from 'sparqlalgebrajs';

// The SparqlEngine with minimum requirements for our application
// TODO: Improve the modularity here

export type ISparqlEngine = RDF.AlgebraSparqlQueryable<Algebra.Project | Algebra.Ask, RDF.BindingsResultSupport & RDF.BooleanResultSupport>;

export interface IContext {
  sparqlEngine: ISparqlEngine;
  context?: RDF.QueryContext | undefined;
}

// export type FieldConfig = GraphQLFieldConfig<RDF.NamedNode<string> | RDF.BlankNode, IContext>
export type FieldConfig = GraphQLFieldConfig<RDF.Term, IContext>

