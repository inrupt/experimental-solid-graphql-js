import { makeExecutableSchema } from '@graphql-tools/schema';
import { getArgumentsWithDirectives, getDocumentNodeFromSchema } from '@graphql-tools/utils';
import { defaultFieldResolver, graphql } from 'graphql';
import { identifierDirective } from '../src/resolvers/argumentDefinitionDirective';
import { coerceLiteralDirective } from '../src/resolvers/coerceLiteralDirective';
import { propertyDirective } from '../src/resolvers/propertyDirective';
import { context } from './context';
import { source } from './source';
import { typeDefs } from './typeDefs';

let schema = makeExecutableSchema({
  typeDefs,
  schemaExtensions
})

// console.log(getArgumentsWithDirectives(getDocumentNodeFromSchema(schema)))

// process.exit();

// TODO: Work out how to ensure the ordering of directives comes from the schema rather than the application here
// TODO: Improve how source is handled (we probably should have an internal property with the node rather than)
// making the node the value itself so that we can also add metadata
schema = coerceLiteralDirective('coerceLiteral')(schema)
schema = propertyDirective('property')(schema);
schema = identifierDirective('identifier')(schema); // TODO: See why coerce is being called excessively (log the resolver from this directive to see what I mean)
// TODO: See if we can map by types instead for ^^

// process.exit();

graphql({
  schema,
  source,
  // fieldResolver(source, args, context, info) {
  //   console.log('field resolver called with', source, args, info.fieldName)
  //   // console.log('field resolver called with', ...args)
  // },
  // It looks like we can pass a context through here
  // typeResolver(value, context, info, abstractType) {
  //   console.log('type resolver called')
  //   return value;
  // },
  contextValue: context
}).then((response) => {
  console.log(JSON.stringify(response, null, 2));
  // console.log(response)
});
