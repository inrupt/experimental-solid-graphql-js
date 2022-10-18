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
import {
  executeSync,
  defaultFieldResolver,
  DocumentNode,
  GraphQLFieldResolver,
  GraphQLSchema,
  execute,
} from "graphql";
import gql from "graphql-tag";
import { DataFactory as DF, Store } from "n3";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { QueryEngine } from "@comunica/query-sparql";
import applyAll from "../lib";

describe("applyAll", () => {
  let schemaString: string;
  let graphqlDocument: DocumentNode;
  let userDocument: DocumentNode;
  let userNameDocument: DocumentNode;
  let fieldResolver: GraphQLFieldResolver<any, any, any, unknown>;
  let res: Record<string, unknown>;
  let resUser: Record<string, unknown>;
  let schema: GraphQLSchema;

  // TODO: Work out why this behaves incorrectly with before each
  beforeAll(() => {
    schemaString = /* GraphQL */ `
      directive @identifier on FIELD_DEFINITION | ARGUMENT_DEFINITION
      directive @webId on FIELD_DEFINITION
      directive @property(iri: ID!) on FIELD_DEFINITION

      scalar ID

      type Person {
        _id: ID! @identifier
        name: String!
          @property(iri: "http://www.w3.org/2000/01/rdf-schema#label")
      }

      type Query {
        person(pid: ID! @identifier): Person
        user: Person! @webId
      }

      schema {
        query: Query
      }
    `;

    graphqlDocument = gql`
      query fetchPerson($pid: ID!) {
        person(pid: $pid) {
          _id
        }
      }
    `;

    userDocument = gql`
      query fetchUser {
        user {
          _id
        }
      }
    `;

    userNameDocument = gql`
      query fetchUserName {
        user {
          name
        }
      }
    `;

    res = {
      data: {
        person: {
          _id: "http://example.org/#me",
        },
      },
    };

    resUser = {
      data: {
        user: {
          _id: "http://example.org/#me",
        },
      },
    };

    const b1 = makeExecutableSchema({
      typeDefs: schemaString,
    });

    schema = applyAll(b1);
  });

  describe("should correctly apply the resolver", () => {
    it("should work with executeSync", () => {
      expect(
        executeSync({
          schema,
          document: graphqlDocument,
          variableValues: { pid: "http://example.org/#me" },
        })
      ).toEqual(res);

      expect(
        executeSync({
          schema,
          document: userDocument,
          contextValue: {
            context: {
              session: {
                info: {
                  webId: "http://example.org/#me",
                  isLoggedIn: true,
                },
              },
            },
          },
        })
      ).toEqual(resUser);
    });

    it("should work with execute", async () => {
      expect(
        await execute({
          schema,
          document: graphqlDocument,
          variableValues: { pid: "http://example.org/#me" },
        })
      ).toEqual(res);

      expect(
        await execute({
          schema,
          document: userDocument,
          contextValue: {
            context: {
              session: {
                info: {
                  webId: "http://example.org/#me",
                  isLoggedIn: true,
                },
              },
            },
          },
        })
      ).toEqual(resUser);

      expect(
        await execute({
          schema,
          document: userNameDocument,
          contextValue: {
            sparqlEngine: new QueryEngine(),
            context: {
              session: {
                info: {
                  webId: "http://example.org/#me",
                  isLoggedIn: true,
                },
              },
              sources: [
                new Store([
                  DF.quad(
                    DF.namedNode("http://example.org/#me"),
                    DF.namedNode("http://www.w3.org/2000/01/rdf-schema#label"),
                    DF.literal("Jesse")
                  ),
                ]),
              ],
            },
          },
        })
      ).toEqual({
        data: {
          user: {
            name: "Jesse",
          },
        },
      });
    });
  });
});
