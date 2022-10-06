import { GraphQLSchema } from 'graphql';

import * as objectField from './objectField';
import * as queryRootField from './queryRootField';
import * as scalarType from './scalarType';
import * as objectType from './objectType';

export function defaultOrder(prefix: string = '') {
  return [
    objectField.identifier(prefix + 'identifier'),
    objectField.label(prefix + 'label'),
    objectField.property(prefix + 'property'),
    queryRootField.identifier(prefix + 'identifier'),
    scalarType.ID(prefix + 'ID'),
    scalarType.date(prefix + 'Date'),
    scalarType.int(prefix + 'Int'),
    scalarType.float(prefix + 'Float'),
    scalarType.url(prefix + 'URL'),
    scalarType.string(prefix + 'String'),
    objectType.is(prefix + 'is'),
  ]
}

export default function(schema: GraphQLSchema, prefix?: string): GraphQLSchema {
  for (const fn of defaultOrder(prefix)) {
    schema = fn(schema);
  }
  return schema;
}

export {
  queryRootField,
  objectField,
  scalarType
}
