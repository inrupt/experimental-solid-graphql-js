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
import type {
  DocumentNode,
  GraphQLFieldResolver,
  GraphQLSchema,
} from "graphql";
import { executeSync, defaultFieldResolver, execute } from "graphql";
import gql from "graphql-tag";
import { DataFactory as DF } from "n3";
import { makeExecutableSchema } from "@graphql-tools/schema";
import linkedDataDirectives, { objectField, scalarType } from "../lib";

describe("objectField", () => {
  describe("identifier", () => {
    let schemaString: string;
    let queryDocument: DocumentNode;
    let fieldResolver: GraphQLFieldResolver<any, any, any, unknown>;
    let res: Record<string, unknown>;
    let schema1: GraphQLSchema;
    let schema2: GraphQLSchema;

    // TODO: Work out why this behaves incorrectly with before each
    beforeAll(() => {
      schemaString = /* GraphQL */ `
        directive @identifier on FIELD_DEFINITION

        scalar ID

        type Person {
          _id: ID! @identifier
        }

        type Query {
          person: Person
        }

        schema {
          query: Query
        }
      `;

      queryDocument = gql`
        query fetchPerson {
          person {
            _id
          }
        }
      `;

      fieldResolver = (source: any, args: any, context: any, info: any) => {
        if (info.fieldName === "person") {
          return DF.namedNode("http://example.org/#me");
        }
        return defaultFieldResolver(source, args, context, info);
      };

      res = {
        data: {
          person: {
            _id: "http://example.org/#me",
          },
        },
      };

      const b1 = makeExecutableSchema({
        typeDefs: schemaString,
      });

      const b2 = makeExecutableSchema({
        typeDefs: schemaString,
      });

      schema1 = scalarType.ID("ID")(objectField.identifier("identifier")(b1));

      schema2 = objectField.identifier("identifier")(scalarType.ID("ID")(b2));
    });

    describe("should correctly apply the resolver", () => {
      it("should work with executeSync", () => {
        expect(
          executeSync({
            schema: schema1,
            document: queryDocument,
            fieldResolver,
          })
        ).toEqual(res);

        expect(
          executeSync({
            schema: schema2,
            document: queryDocument,
            fieldResolver,
          })
        ).toEqual(res);
      });

      it("should work with execute", async () => {
        expect(
          await execute({
            schema: schema1,
            document: queryDocument,
            fieldResolver,
          })
        ).toEqual(res);

        expect(
          await execute({
            schema: schema2,
            document: queryDocument,
            fieldResolver,
          })
        ).toEqual(res);
      });
    });
  });

  describe("scalars", () => {
    let schemaString: string;
    let queryDocument: DocumentNode;
    let fieldResolver: GraphQLFieldResolver<any, any, any, unknown>;
    let res: Record<string, unknown>;
    let schema1: GraphQLSchema;

    // TODO: Work out why this behaves incorrectly with before each
    beforeAll(() => {
      schemaString = /* GraphQL */ `
        directive @identifier on FIELD_DEFINITION
        directive @property(iri: String!) on FIELD_DEFINITION

        scalar ID
        scalar Date
        scalar URL

        type Person {
          _id: ID! @identifier
          dob: Date!
          age: Int!
          name: String!
          image: URL!
          num: Float!
        }

        type Query {
          person: Person
        }

        schema {
          query: Query
        }
      `;

      queryDocument = gql`
        query fetchPerson {
          person {
            _id
            dob
            age
            name
            image
            num
          }
        }
      `;

      fieldResolver = (source: any, args: any, context: any, info: any) => {
        if (info.fieldName === "person") {
          return DF.namedNode("http://example.org/#me");
        }
        if (info.fieldName === "dob") {
          return DF.literal(
            "2000-01-01",
            DF.namedNode("http://www.w3.org/2001/XMLSchema#date")
          );
        }
        if (info.fieldName === "age") {
          return DF.literal(
            "22",
            DF.namedNode("http://www.w3.org/2001/XMLSchema#integer")
          );
        }
        if (info.fieldName === "num") {
          return DF.literal(
            "22.5",
            DF.namedNode("http://www.w3.org/2001/XMLSchema#double")
          );
        }
        if (info.fieldName === "name") {
          return DF.literal("Jesse");
        }
        if (info.fieldName === "image") {
          return DF.literal(
            "https://avatars.githubusercontent.com/u/63333554?v=4",
            DF.namedNode("http://www.w3.org/2001/XMLSchema#anyURI")
          );
        }
        return defaultFieldResolver(source, args, context, info);
      };

      res = {
        data: {
          person: {
            _id: "http://example.org/#me",
            age: 22,
            dob: new Date(Date.UTC(2000, 0)),
            name: "Jesse",
            image: new URL(
              "https://avatars.githubusercontent.com/u/63333554?v=4"
            ),
            num: 22.5,
          },
        },
      };

      const b1 = makeExecutableSchema({
        typeDefs: schemaString,
      });

      schema1 = linkedDataDirectives(b1);
    });

    describe("should correctly apply the resolver", () => {
      it("should work with executeSync", () => {
        expect(
          executeSync({
            schema: schema1,
            document: queryDocument,
            fieldResolver,
          })
        ).toEqual(res);
      });

      it("should work with execute", async () => {
        expect(
          await execute({
            schema: schema1,
            document: queryDocument,
            fieldResolver,
          })
        ).toEqual(res);
      });
    });
  });
});
