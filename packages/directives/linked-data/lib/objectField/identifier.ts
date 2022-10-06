import { mapObjectField } from "@inrupt/graphql-directives-utils";
import { Source } from '../types';

export const identifier = mapObjectField<any, any, Source>(
  (resolver) =>
    (source: Source, args, context, info) => {
      // resolver({ ...source, [info.fieldName]: source.__node }, args, context, info)
      return resolver({ [info.fieldName]: source }, args, context, info)
    }
)
