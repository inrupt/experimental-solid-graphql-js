import { makeExecutableSchema, } from "@graphql-tools/schema";
import { getOperationASTFromDocument, mapSchema } from "@graphql-tools/utils";
import { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { ExecutionResult, Source } from "graphql";
import { GraphQLSchema } from "graphql";
import { graphql, getOperationAST, execute, buildSchema, } from "graphql";
import { IContext, ISparqlEngine, OperationVariables } from "./types";
import * as directives from './directives';

export interface ISolidQueryOptions<TData, TVariables> {
  document: TypedDocumentNode<TData, TVariables>;
  schema: GraphQLSchema
  // query: TypedDocumentNode<TData, TVariables>['__apiType']
  variables: TVariables;
  // TODO: Improve typing of context
  context: IContext;
}

export async function solidQuery<TData, TVariables extends Record<string, any>>(options: ISolidQueryOptions<TData, TVariables>): Promise<ExecutionResult<TData>> {
  let { schema } = options;
  
  
  
  // const schema = makeExecutableSchema({
  //   typeDefs: options.document
  // });

  // getOperationASTFromDocument(schema)
  // console.log(JSON.stringify(options.document, null, 2))
  // console.log(JSON.stringify(schema, null, 2))
  // console.log('query type', schema.getQueryType())

  // schema = directives.upperDirectiveTransformer(schema, 'upper');
  // schema = mapSchema(schema);
  schema = directives.identifierObjectFieldDirective('identifier')(schema);
  schema = directives.identifierQueryRootFieldDirective('identifier')(schema);
  schema = directives.propertyDirective('property')(schema);
  schema = directives.coerceLiteralDirective('coerceLiteral')(schema);

  // TODO: Work out why this needs to be put *after* the other directives
  schema = directives.upperDirectiveTransformer(schema, 'upper');

  return execute({
    schema: schema,
    document: options.document,
    variableValues: options.variables,
    contextValue: options.context,
    // typeResolver(...args) {
    //   console.log('type resolver called')
    //   return args[0]
    // },
    // fieldResolver(...args) {
    //   console.log('field resolver called', args[0])
    //   return args[0].__node.value
    // }
    // extensions
    // rootValue: getOperationAST(options.document)
  }) as Promise<ExecutionResult<TData>> | ExecutionResult<TData>;
  
  
  
  
  
  // const source = getOperationAST(options.document)?.loc?.source;

  // if (!source) {
  //   console.log(JSON.stringify(getOperationAST(options.document), null, 2))
  //   throw new Error('No Source Found');
  // }

  // return graphql({
  //   schema,
  //   variableValues: options.variables,
  //   source
  // }) as Promise<ExecutionResult<TData>>;
}
