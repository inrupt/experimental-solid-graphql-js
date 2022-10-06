import applyLinkedDataDirectives from '@inrupt/graphql-directives-linked-data';
import { GraphQLSchema } from 'graphql';
import * as objectField  from './objectField';


export function defaultOrder(prefix: string = '') {
  return [
    objectField.webid('webId')
  ]
}

export default function(schema: GraphQLSchema, prefix?: string): GraphQLSchema {
  schema = applyLinkedDataDirectives(schema);

  for (const fn of defaultOrder(prefix)) {
    schema = fn(schema);
  }

  return schema;
}

export {
  objectField
}
