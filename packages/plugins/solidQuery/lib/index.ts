import { Types } from '@graphql-codegen/plugin-helpers';
import { GraphQLSchema, printSchema, parse } from 'graphql';

// Adds the compiled schema to the source document
export function plugin<T = any>(schema: GraphQLSchema, documents: Types.DocumentFile[], config: T): Types.Promisable<Types.PluginOutput> {
  return {
    content: '',
    prepend: [
      `import { execute, type ExecutionResult } from 'graphql'`,
      `import { TypedDocumentNode } from '@graphql-typed-document-node/core'`,
      `import * as RDF from '@rdfjs/types'`,
      `import { Algebra } from 'sparqlalgebrajs'`
    ],
    append: [`
export type ISparqlEngine = RDF.AlgebraSparqlQueryable<Algebra.Project | Algebra.Ask, RDF.BindingsResultSupport & RDF.BooleanResultSupport>;


export interface IContext {
  sparqlEngine: ISparqlEngine;
  context?: RDF.QueryContext | undefined;
}

export interface ISolidQueryOptions<TData, TVariables> {
  document: TypedDocumentNode<TData, TVariables>;
  variables: TVariables;
  context: IContext;
}

export async function solidQuery<TData, TVariables extends Record<string, any>>(options: ISolidQueryOptions<TData, TVariables>): Promise<ExecutionResult<TData>> {
  return execute({
    schema,
    document: options.document,
    variableValues: options.variables,
    contextValue: options.context,
  }) as Promise<ExecutionResult<TData>> | ExecutionResult<TData>;
}`
    ]
  }
}
