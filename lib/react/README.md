TODO: Add something similar to @apollo/react-components here

With the query we should be able to, after codegen, do the following

import { Query, FetchAlbumDocument, FetchAlbumsQuery } from '../graphql'

<Query query={FetchAlbumDocument} variables={{ _id: albumId }} loading={Fallback} error={ErrorFallback}>
  data => <AlbumComponent data={data}>
</Query>

function AlbumComponent({ data: FetchAlbumsQuery }) {

}

 ... or ...

 <Query
    query={FetchAlbumDocument}
    variables={{ _id: albumId }}
    loading={Fallback}
    error={ErrorFallback}
    result={AlbumComponent}
    />



While the codegen.yml would be


```ts
schema: graphql/schema.graphql
documents:
  - graphql/queries/*.graphql
  - graphql/mutations/*.graphql
generates:
  graphql/index.ts:
    plugins:
      - typescript
      - typescript-operations
      - typed-document-node
    # Requires the graphql-scalars package
    config:
      scalars:
        ID: string
```



```ts
schema: graphql/schema.graphql
documents:
  - graphql/queries/*.graphql
  - graphql/mutations/*.graphql
generates:
  graphql/index.ts:
    plugins:
      - typescript
      - typescript-operations
      - typed-document-node
      # Injects Query and useQuery into the generated file with built-in calls to the engine
      - solid-react
      # Handles custom data types
      - solid-types
      # Creates an engine with relevant resolver mappings applied within the engine (one should be able to enable/disable these in the config below)
      - solid-engine
      - solid-resolvers
      # Exports login/logout callbacks + session info whilst applying a session by default to the enigne.
      - solid-auth
    # Requires the graphql-scalars package
    config:
      # If engine is not specified then use @comunica/query-sparql-reasoning-solid by default
      engine: 
        build: "@comunica/query-sparql-reasoning-solid"
          params:
            # Enable RDFS Reasoning
            rules: RDFS # Actually this engine config should go with solid-engine

```


// TODO: Use react lazy loading to retrieve query component.

// I think we should be doing something like this in codegen.
```ts
const Query = lazy(() => import("@inrupt/solid-graphql-react").Query)
```



/// <reference types="react" />
import { DocumentNode } from 'graphql';
import { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { OperationVariables, DefaultContext, ApolloCache } from '../../core';
import { QueryFunctionOptions, QueryResult, BaseMutationOptions, MutationFunction, MutationResult, BaseSubscriptionOptions, SubscriptionResult } from '../types/types';
export interface QueryComponentOptions<TData = any, TVariables = OperationVariables> extends QueryFunctionOptions<TData, TVariables> {
    children: (result: QueryResult<TData, TVariables>) => JSX.Element | null;
    query: DocumentNode | TypedDocumentNode<TData, TVariables>;
}
export interface MutationComponentOptions<TData = any, TVariables = OperationVariables, TContext = DefaultContext, TCache extends ApolloCache<any> = ApolloCache<any>> extends BaseMutationOptions<TData, TVariables, TContext, TCache> {
    mutation: DocumentNode | TypedDocumentNode<TData, TVariables>;
    children: (mutateFunction: MutationFunction<TData, TVariables, TContext>, result: MutationResult<TData>) => JSX.Element | null;
}
export interface SubscriptionComponentOptions<TData = any, TVariables = OperationVariables> extends BaseSubscriptionOptions<TData, TVariables> {
    subscription: DocumentNode | TypedDocumentNode<TData, TVariables>;
    children?: null | ((result: SubscriptionResult<TData>) => JSX.Element | null);
}
//# sourceMappingURL=types.d.ts.map