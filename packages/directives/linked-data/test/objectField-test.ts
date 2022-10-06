import { executeSync, defaultFieldResolver, DocumentNode, GraphQLFieldResolver, GraphQLSchema, execute } from 'graphql';
import { objectField, scalarType } from '../lib';
import gql from 'graphql-tag';
import { DataFactory as DF } from 'n3';
import { makeExecutableSchema } from '@graphql-tools/schema'

describe('objectField', () => {
  describe('identifier', () => {
    let schemaString: string;
    let document: DocumentNode;
    let fieldResolver: GraphQLFieldResolver<any, any, any, unknown>;
    let res: Object;
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
        }`

      document = gql`
        query fetchPerson {
          person {
            _id
          }
        }`

      fieldResolver = (source: any, args: any, context: any, info: any) => {
        if (info.fieldName === 'person') {
          return DF.namedNode("http://example.org/#me")
          return {
            __node: DF.namedNode("http://example.org/#me")
          }
        }
        return defaultFieldResolver(source, args, context, info)
      }

      res = {
        data: {
          person: {
            _id: "http://example.org/#me"
          }
        }
      }

      const b1 = makeExecutableSchema({
        typeDefs: schemaString
      });

      const b2 = makeExecutableSchema({
        typeDefs: schemaString
      })

      schema1 = scalarType.ID('ID')(
        objectField.identifier('identifier')(
          b1
        )
      );

      schema2 = objectField.identifier('identifier')(
        scalarType.ID('ID')(
          b2
        )
      );
    });


    describe('should correctly apply the resolver', () => {
      it('should work with executeSync', () => {
        expect(executeSync({
          schema: schema1,
          document,
          fieldResolver,
        })).toEqual(res);

        expect(executeSync({
          schema: schema2,
          document,
          fieldResolver,
        })).toEqual(res);
      });

      it('should work with execute', async () => {
        expect(await execute({
          schema: schema1,
          document,
          fieldResolver,
        })).toEqual(res);

        expect(await execute({
          schema: schema2,
          document,
          fieldResolver,
        })).toEqual(res);
      });
    });
  });
});
