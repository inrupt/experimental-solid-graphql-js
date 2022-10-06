import { Types } from '@graphql-codegen/plugin-helpers';
import { GraphQLSchema } from 'graphql';

import * as schemaNode from '@inrupt/graphql-codegen-schema-node';
import * as solidQuery from '@inrupt/graphql-codegen-solid-query';
import * as solidSchema from '@inrupt/graphql-codegen-solid-schema';

// Adds the compiled schema to the source document
export async function plugin<T = any>(schema: GraphQLSchema, documents: Types.DocumentFile[], config: T): Promise<Types.PluginOutput> {
  let content = '';
  let append: string[] = [];
  let prepend: string[] = [];
  
  for (const fn of [schemaNode.plugin, solidSchema.plugin, solidQuery.plugin]) {
    const r = await fn(schema, documents, config);
    if (typeof r === 'string') {
      content += r;
    } else {
      content += r.content;
      if (r.append) {
        append = append.concat(...r.append)
      }
      if (r.prepend) {
        prepend = prepend.concat(...r.prepend)
      }
    }
  }


  return { content, append, prepend }
}

export const addToSchema = solidSchema.addToSchema;
