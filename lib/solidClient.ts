import { makeExecutableSchema, } from "@graphql-tools/schema";
import { getOperationASTFromDocument, mapSchema } from "@graphql-tools/utils";
import { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { ExecutionResult, Source } from "graphql";
import { GraphQLSchema } from "graphql";
import { graphql, getOperationAST, execute, buildSchema, } from "graphql";
import { IContext, ISparqlEngine, OperationVariables } from "./types";
import * as directives from './directives';
import { queryLabel, queryObjects } from './sparql'
import { DataFactory as DF } from 'n3';
import { wrap } from 'asynciterator';

export interface ISolidQueryOptions<TData, TVariables> {
  document: TypedDocumentNode<TData, TVariables>;
  schema: GraphQLSchema
  // query: TypedDocumentNode<TData, TVariables>['__apiType']
  variables: TVariables;
  // TODO: Improve typing of context
  context: IContext;
}

export async function solidQuery<TData, TVariables extends Record<string, any>>(options: ISolidQueryOptions<TData, TVariables>): Promise<ExecutionResult<TData>> {
  // Note: This is just a sanity check that our setup enables the retrieval of ancestors
  // console.time('get ancestors')
  // queryObjects(
  //   options.context,
  //   DF.namedNode('https://id.inrupt.com/jeswr'),
  //   DF.namedNode('http://example.org/dob')
  // )

  // console.log(1)
  // const ancestors = await queryObjects(
  //     options.context,
  //     DF.namedNode('https://id.inrupt.com/jeswr'),
  //     DF.namedNode('http://example.org/ancestor')
  //   )
  //   // .then(result => wrap(result))
  //   .then(result => result.toArray())
  //   // .then(results => Promise.all(results.map(d => queryLabel(options.context, d))))
  //   // .then(results => results.map(r => r.value));
  // console.log(2)
  // console.log(ancestors)

  // console.timeEnd('get ancestors')
  // // console.log(ancestors);
  // throw new Error('')
  
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

  // TODO: Use this
  schema = directives.labelDirective('label')(schema);
  
  // Have an applyDirectives method that applies all directives
  schema = directives.identifierObjectFieldDirective('identifier')(schema);
  schema = directives.identifierQueryRootFieldDirective('identifier')(schema);
  schema = directives.propertyDirective('property')(schema);
  schema = directives.coerceLiteralDirective('coerceLiteral')(schema);
  schema = directives.coerceXSDDatesDirective('xsdDate')(schema);
  schema = directives.yearsToNowDirective('yearsToNow')(schema);

  // TODO: Work out why this needs to be put *after* the other directives
  schema = directives.upperDirectiveTransformer(schema, 'upper');
  // schema = directives.coerceLabelScalar('Label')(schema);

  return execute({
    schema: schema,
    document: options.document,
    variableValues: options.variables,
    contextValue: options.context,
    // fieldResolver(...args) {
    //   return args[0]
    // }
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
