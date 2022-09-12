import { execute, GraphQLObjectType, GraphQLSchema } from 'graphql';
import { makeExecutableSchema, addResolversToSchema, } from '@graphql-tools/schema';
import gql from 'graphql-tag';

const document = gql`
{
  hero {
    name
    appearsIn
  }
}
`

const typeDefs = gql`
schema 
  # @prefixes(
  #   _base: "http://example.org/human/",
  #   human: "http://example.org/human/",
  #   starwars: "http://starwars.com/data/"
  # )
{
  query: Query
}

type Query {
  hero: Character!
}

type Character {
  name: String! #@is(property: "foaf:name")
  appearsIn: [String!]!
}
`

const schema = makeExecutableSchema({
  typeDefs,
  // resolvers: {
  //   prefixes(...args) {
  //     console.log('prefixes called', args)
  //     return {};
  //   }
  // }
})

schema.extensions

// export type GraphQLTypeResolver<TSource, TContext> = (
//   value: TSource,
//   context: TContext,
//   info: GraphQLResolveInfo,
//   abstractType: GraphQLAbstractType,
// ) => PromiseOrValue<Maybe<GraphQLObjectType<TSource, TContext> | string>>;


const result = execute({
  schema,
  // document,
  document: typeDefs,
  fieldResolver(a, b, c, d) {
    console.log(a, b, c, d);
    return null;
  },
  // typeResolver() {

  // }
})

Promise.resolve(result).then(r => {
  console.log(r);
})
