//
// Copyright 2022 Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
import type { Types } from "@graphql-codegen/plugin-helpers";
import type { GraphQLSchema } from "graphql";

import * as schemaNode from "@inrupt/graphql-codegen-schema-node";
import * as solidQuery from "@inrupt/graphql-codegen-solid-query";
import * as solidSchema from "@inrupt/graphql-codegen-solid-schema";

// Adds the compiled schema to the source document
export async function plugin<T = any>(
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: T
): Promise<Types.PluginOutput> {
  let content = "";
  let append: string[] = [];
  let prepend: string[] = [];

  for (const fn of [schemaNode.plugin, solidSchema.plugin, solidQuery.plugin]) {
    // eslint-disable-next-line no-await-in-loop
    const r = await fn(schema, documents, config);
    if (typeof r === "string") {
      content += r;
    } else {
      content += r.content;
      if (r.append) {
        append = append.concat(...r.append);
      }
      if (r.prepend) {
        prepend = prepend.concat(...r.prepend);
      }
    }
  }

  return { content, append, prepend };
}

export const { addToSchema } = solidSchema;
