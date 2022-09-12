import * as RDF from '@rdfjs/types';
import { Algebra } from 'sparqlalgebrajs';
import { SparqlEngine } from './sparqlEngine';
import { DocumentNode, TypedQueryDocumentNode, ExecutionResult, execute, ExecutionArgs, FormattedExecutionResult, ExecutableDefinitionNode, Kind, FragmentDefinitionNode, SelectionSetNode, GraphQLResolveInfo } from 'graphql';
import { OperationDefinitionNode } from 'graphql';

type PromiseOrValue<T> = T | Promise<T>;


// export interface ExecutionArgs {
//   schema: GraphQLSchema;
//   document: DocumentNode;
//   rootValue?: any;
//   contextValue?: any;
//   variableValues?: Maybe<{ [key: string]: any }>;
//   operationName?: Maybe<string>;
  // fieldResolver?: Maybe<GraphQLFieldResolver<any, any>>;
//   typeResolver?: Maybe<GraphQLTypeResolver<any, any>>;
// }

function fieldResolver<
  TSource,
  TContext,
  TArgs = { [argName: string]: any }
>(
  source: TSource,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) {
  source
}

function executeSolid(args: ExecutionArgs): PromiseOrValue<ExecutionResult> {
  return execute(args);
}




export interface ISolidGraphQLClientOptions {
  sparqlEngine: RDF.AlgebraSparqlQueryable<Algebra.Project, RDF.BindingsResultSupport>
}

// TODO:
// Fully align with options in https://github.com/apollographql/apollo-client/blob/main/src/core/watchQueryOptions.ts

export interface ISolidGraphQLQueryOptions<
  TResponseData = Record<string, any>,
  TRequestVariables = Record<string, any>
> {
  // TODO: Fix this typing
  document: DocumentNode | TypedQueryDocumentNode<TResponseData, TRequestVariables>;
}

export class SolidGraphQLClient {
  private sparql: SparqlEngine;

  constructor(options: ISolidGraphQLClientOptions) {
    this.sparql = new SparqlEngine(options.sparqlEngine);
  }

  /**
   * Executes a GraphQL query according to the options specified
   */
  public query<
    TResponseData = Record<string, any>,
    TRequestVariables = Record<string, any>,
    TExtensions = Record<string, any>
  >(options: ISolidGraphQLQueryOptions<TResponseData, TRequestVariables>): ExecutionResult<TResponseData, TExtensions> {
    // TODO: Long term see if we need the leading validation checks prior to fetchQuery in fetchQueryObservable on Apollo Client
    // https://github.com/apollographql/apollo-client/blob/342c8f098505e31ae49a8e285c26fe3b5e361509/src/core/ApolloClient.ts#L314
    // https://github.com/apollographql/apollo-client/blob/342c8f098505e31ae49a8e285c26fe3b5e361509/src/core/QueryManager.ts#L651
    // https://github.com/apollographql/apollo-client/blob/342c8f098505e31ae49a8e285c26fe3b5e361509/src/core/QueryManager.ts#L517
    options.document.definitions

    throw new Error('')
  }
  
  private queryTypedQueryDocumentNode<
    TResponseData = Record<string, any>,
    TRequestVariables = Record<string, any>,
  >(document: TypedQueryDocumentNode<TResponseData, TRequestVariables>) {
    // TODO: make use of this document.__ensureTypesOfVariablesAndResultMatching
    document.definitions.map(definition => this.queryExecutableDefinitionNode(definition))
  }

  private queryExecutableDefinitionNode(definition: ExecutableDefinitionNode) {
    if (definition.kind === Kind.OPERATION_DEFINITION) {
      return this.queryOperatorDefinition(definition);
    }
    if (definition.kind === Kind.FRAGMENT_DEFINITION) {
      return this.queryFragmentDefinition(definition);
    }
  }

  private queryOperatorDefinition(definition: OperationDefinitionNode): unknown {
    definition.selectionSet
    // throw new Error('Not Implemented');
  }

  private evaluateSelectionSet(selectionSet: SelectionSetNode) {
    selectionSet.selections
  }

  private queryFragmentDefinition(definition: FragmentDefinitionNode): unknown {
    throw new Error('Not Implemented');
  }
}