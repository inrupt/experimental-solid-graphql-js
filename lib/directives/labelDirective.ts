import { mapSchema, MapperKind } from "@graphql-tools/utils";
import { GraphQLSchema } from "graphql";
import { queryLabel, queryObject } from "../sparql";
import { FieldConfig } from "../types";
import { getSingleDirective, getResolverFromConfig } from "./util";

export function labelDirective(directiveName: string): (schema: GraphQLSchema) => GraphQLSchema {
  return schema =>
    mapSchema(schema, {
      [MapperKind.OBJECT_FIELD]: (fieldConfig: FieldConfig) => {
        const directive = getSingleDirective(schema, fieldConfig, directiveName);

        if (directive) {
          // Get this field's original resolver
          const resolve = getResolverFromConfig(fieldConfig);

          // Replace the original resolver with a function that *first* replaces the node with the identifier
          // and then performs the standard resolution actions
          fieldConfig.resolve = async function (source, args, context, info) {
            return resolve(
              {
                [info.fieldName]: {
                  __node: await queryLabel(context, source.__node)
                }
              },
              args, context, info
            );
          }
        }

        return fieldConfig;
      }
    })
}
