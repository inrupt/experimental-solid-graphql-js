// Approach [1] of [2]
// https://www.graphql-tools.com/docs/generate-schema

import { makeExecutableSchema, addResolversToSchema } from '@graphql-tools/schema';
// import schema from './person.graphql'
import { type GraphQLResolveInfo, DocumentNode } from 'graphql';

let schema = makeExecutableSchema({

})

function defaultFieldResolver<TSource, TContext, TArgs = Record<string, any>, TReturn = any>(source: TSource, args: TArgs, context: TContext, info: GraphQLResolveInfo): TReturn {
  
}


schema = addResolversToSchema({
  schema,
  defaultFieldResolver,
  resolvers: {}
})


// Approach [2] of [2]


