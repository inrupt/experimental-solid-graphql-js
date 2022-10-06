import { mapObjectField } from "@inrupt/graphql-directives-utils";
import { queryLabel } from '@inrupt/sparql-utils';
import { Source } from '../types';

export const label = mapObjectField<any, any, Source>(
  (resolver) =>
    (source: Source, args, context, info) =>
      resolver({ ...source, [info.fieldName]: { __node: queryLabel(context, source.__node!) } }, args, context, info)
)