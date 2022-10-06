import { mapObjectField } from "@inrupt/graphql-directives-utils";
import { getWebIdFromContext } from '../utils';

// TODO: Use source type instead of any
export const webid = mapObjectField<any, any, any>(
  (resolver) =>
    (source: any, args, context, info) =>
      // TODO: Clean this up and improve types.
      // resolver({ ...source, [info.fieldName]: { __node: getWebIdFromContext(context.context) } }, args, context, info)
      resolver({ ...source, [info.fieldName]: getWebIdFromContext(context.context) }, args, context, info)
)
