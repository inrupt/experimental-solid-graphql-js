//
// Copyright 2022 Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
import type { Types } from "@graphql-codegen/plugin-helpers";
import type { GraphQLSchema } from "graphql";

// Adds the compiled schema to the source document
export function plugin<T = any>(
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: T
): Types.Promisable<Types.PluginOutput> {
  return {
    content: "",
    prepend: [
      `import { execute, type ExecutionResult } from 'graphql'`,
      `import { TypedDocumentNode } from '@graphql-typed-document-node/core'`,
      `import * as RDF from '@rdfjs/types'`,
      `import { Algebra } from 'sparqlalgebrajs'`,
    ],
    append: [
      `
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
}`,
    ],
  };
}
