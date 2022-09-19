import { TypedDocumentNode, ResultOf } from "@graphql-typed-document-node/core";
import { graphql } from "graphql";
import { IContext, ISparqlEngine, OperationVariables } from "./types";

function solidQuery<TData, TVariables>(query: TypedDocumentNode<TData, TVariables>): TData {
  throw new Error('Not Implemented');
}
