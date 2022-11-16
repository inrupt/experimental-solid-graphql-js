# solid-graphql-js experiment

This repo is a proof-of-concept demonstrating how we can query over the Solid ecosystem using spec-compliant GraphQL.

## Warning

This code is experimental, it could change or disappear at any time and comes with no maintenance guarantees.

## What is this for?

This codebase is designed to demonstrate _one possible abstraction layer_ for querying in Solid. In this instance we are demonstrating how it is possible to query over Solid using a spec-compliant GraphQL engine backed by [Comunica](https://comunica.dev/).

## Usage

These packages build off [graphql-js](https://graphql.org/graphql-js/) by providing custom [directives](https://graphql.org/learn/queries/#directives) to specify how fields evaluate fields in GraphQL schemas.

The key directives added are the `@is` (which is used to assert the `rdf:type` a particular object type must have when it is retrieved) and `@property` directive is used to specify the `iri` that should be looked up to get the value of an object field.

```ts
type Human @is(class: "http://example.org/Person") {
  // The `@identifier` here indicates that a particular
  // field should be assigned to the `iri` of the Thing that
  // is being queried.
  id: ID! @identifier
  name: String! @property(iri: "http://www.w3.org/2000/01/rdf-schema#label")
  biologicalMother: Human! @property(iri: "http://example.org/biologicalMother")
}

type Query {
  // The `@identifier` here indicates that we should be
  // looking up the Human associated to the `_id` iri that
  // was given as an input to the query.
  person(_id: ID! @identifier): Human!

  // Note if we wanted to query about the user that is
  // currently logged in then this can be written as
  // person: Human! @webId
}

schema {
  query: Query
}
```

We strongly recommend making use of codegen and the [typed-document-node](https://the-guild.dev/blog/typed-document-node) feature to enforce strict typings in code based on the GraphQL schema. The examples demonstrate our recommended setup which consists of the following codegen file

codegen.yml

```yml
schema: graphql/schemas/**/*.graphql
documents:
  - graphql/queries/*.graphql
generates:
  graphql/index.ts:
    plugins:
      - "@inrupt/experimental-graphql-codegen-solid"
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

**Warning** this app is a PoC and is not stable; in particular the login flow is not stable in all browsers. Consequently, we recommend using Chromium based browsers for this demo.

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
