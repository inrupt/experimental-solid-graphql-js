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
  typeDefs
})

// console.log(getArgumentsWithDirectives(getDocumentNodeFromSchema(schema)))

// process.exit();

// TODO: Work out how to ensure the ordering of directives comes from the schema rather than the application here
schema = coerceLiteralDirective('coerceLiteral')(schema)
schema = propertyDirective('property')(schema);
schema = identifierDirective('identifier')(schema); // TODO: See why coerce is being called excessively

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
