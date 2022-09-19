import { Algebra } from 'sparqlalgebrajs';
import * as RDF from '@rdfjs/types';
import { GraphQLFieldConfig } from 'graphql';

export type ISparqlEngine = RDF.AlgebraSparqlQueryable<Algebra.Project | Algebra.Ask, RDF.BindingsResultSupport & RDF.BooleanResultSupport>;

export interface IContext {
  sparqlEngine: ISparqlEngine;
  context?: RDF.QueryContext | undefined;
}

export type OperationVariables = Record<string, any>;

// export type FieldConfig = GraphQLFieldConfig<RDF.NamedNode<string> | RDF.BlankNode, IContext>
export type FieldConfig = GraphQLFieldConfig<{ __node: RDF.Term }, IContext>
