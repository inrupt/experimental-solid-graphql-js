# solid-graphql-js experiment

This repo is a proof-of-concept demonstrating how we can query over the Solid ecosystem using GraphQL. We strongly recommend making use of codegen and the [typed-document-node](https://the-guild.dev/blog/typed-document-node) feature to enforce strict typings in code.

The examples demonstrate our recommended setup which consists of the following codegen file

codegen.yml

```yml
schema: graphql/schemas/**/*.graphql
documents:
  - graphql/queries/*.graphql
generates:
  graphql/index.ts:
    plugins:
      - "@inrupt/graphql-codegen-solid"
      - typescript
      - typescript-operations
      - typed-document-node
    config:
      scalars:
        Date: Date
        URL: URL
        ID: string
        Float: number
        Int: number
```

This can be used to generate the `solidQuery` graphql query engine; and any queries defined in your `/queries` documents. This generated code can then be used as follows:

```ts
// Generated code
import { solidQuery, FetchPersonDocument } from "../graphql";
import { QueryEngine } from '@comunica/query-sparql-file';

async function myFunction() {
  const { data, errors } = await solidQuery({
    document: FetchPersonDocument,
    variables: {
      id: "https://id.inrupt.com/jeswr",
    },
    context: {
      // Any RDFJS compliant query engine can be used here
      sparqlEngine: new QueryEngine(),
      context: {
        sources: [
          "https://id.inrupt.com/jeswr"
        ],
      },
    },
  });
```

The returned data contains the query response if it successful. Otherwise the errors response will contain any errors caused during query execution.

For use in react see the `solid-music` demo.

## Running the human demo

This demo shows how to run GraphQL queries over a local file

How to run:

```sh
npm install # (or npm ci)

# build the various modules and packages
npm run build

# start the development server
npm run demo:cli
```

## Running the human-solid demo

This demo shows how to run GraphQL queries over a Solid Pod.

How to run:

```sh
npm install # (or npm ci)

# build the various modules and packages
npm run build

# start the development server
npm run demo:cli:solid
```

When prompted username and password are: hello@example.com / abc123.

## Running the human-solid-introspection demo

This demo shows how to run GraphQL queries over a Solid Pod - with the GraphQL schema generated from the FOAF
vocabulary.

The generated schema can be found under `examples/human-solid-introspection/.mesh/`.

How to run:

```sh
npm install # (or npm ci)

# build the various modules and packages
npm run build

# start the development server
npm run demo:cli:solid:introspection
```

When prompted username and password are: hello@example.com / abc123.

## Running the solid-music demo

A sample application built using the graphql components

How to run:

```sh
npm install # (or npm ci)

# build the various modules and packages
npm run build

# start the development server
npm run dev
```

Once logged into the application click sign in. The test server is the last option on the sign in page.

The default development server username and password are: hello@example.com / abc123.

You can also log into solidweb.me with the credentials music@demo.org / musicDemo

**Note**: Each of the solid-related demos is run against a local instance of the CSS, the data for the Pod that is created for the demo can be found in the `/pod` folder in each of the respective demos. If extending a demo and additional data is required for the query, it should be added to the relevant `.ttl` files in those folders.
