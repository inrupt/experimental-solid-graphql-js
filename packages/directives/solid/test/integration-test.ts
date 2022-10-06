import applyAll from '../lib';
import { executeSync, defaultFieldResolver, DocumentNode, GraphQLFieldResolver, GraphQLSchema, execute } from 'graphql';
import gql from 'graphql-tag';
import { DataFactory as DF, Store } from 'n3';
import { makeExecutableSchema } from '@graphql-tools/schema'
import { QueryEngine } from '@comunica/query-sparql';

describe('applyAll', () => {
  let schemaString: string;
  let document: DocumentNode;
  let userDocument: DocumentNode;
  let userNameDocument: DocumentNode;
  let fieldResolver: GraphQLFieldResolver<any, any, any, unknown>;
  let res: Object;
  let resUser: Object;
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
          name: String! @property(iri: "http://www.w3.org/2000/01/rdf-schema#label")
        }

        type Query {
          person(pid: ID! @identifier): Person
          user: Person! @webId
        }

        schema {
          query: Query
        }`

    document = gql`
        query fetchPerson($pid: ID!) {
          person(pid: $pid) {
            _id
          }
        }`

    userDocument = gql`
      query fetchUser {
        user {
          _id
      }
    }`

    userNameDocument = gql`
      query fetchUserName {
        user {
          name
      }
    }`

    res = {
      data: {
        person: {
          _id: "http://example.org/#me"
        }
      }
    }

    resUser = {
      data: {
        user: {
          _id: "http://example.org/#me"
        }
      }
    }

    const b1 = makeExecutableSchema({
      typeDefs: schemaString
    });

    schema = applyAll(b1);
  });


  describe('should correctly apply the resolver', () => {
    it('should work with executeSync', () => {
      expect(executeSync({
        schema,
        document,
        variableValues: { pid: "http://example.org/#me" }
      })).toEqual(res);

      expect(executeSync({
        schema,
        document: userDocument,
        contextValue: {
          context: {
            session: {
              info: {
                webId: "http://example.org/#me",
                isLoggedIn: true
              }
            }
          }
        }
      })).toEqual(resUser);
    });

    it('should work with execute', async () => {
      expect(await execute({
        schema,
        document,
        variableValues: { pid: "http://example.org/#me" }
      })).toEqual(res);

      expect(await execute({
        schema,
        document: userDocument,
        contextValue: {
          context: {
            session: {
              info: {
                webId: "http://example.org/#me",
                isLoggedIn: true
              }
            }
          }
        }
      })).toEqual(resUser);

      expect(await execute({
        schema,
        document: userNameDocument,
        contextValue: {
          sparqlEngine: new QueryEngine(),
          context: {
            session: {
              info: {
                webId: "http://example.org/#me",
                isLoggedIn: true
              }
            },
            sources: [
              new Store(
                [
                  DF.quad(
                    DF.namedNode("http://example.org/#me"),
                    DF.namedNode("http://www.w3.org/2000/01/rdf-schema#label"),
                    DF.literal("Jesse"),
                  )
                ]
              )
            ]
          }
        }
      })).toEqual({
        data: {
          user: {
            name: "Jesse"
          }
        }
      });
    });
  });
});
