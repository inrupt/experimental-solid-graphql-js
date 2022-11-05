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
import { DataFactory as DF } from "n3";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { objectField, scalarType } from "../lib";

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
});
