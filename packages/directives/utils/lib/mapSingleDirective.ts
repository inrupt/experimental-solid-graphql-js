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
import type {
  GraphQLFieldConfig,
  GraphQLFieldResolver,
  GraphQLSchema,
} from "graphql";
import { getResolver } from "./getResolver";
import { getSingleDirective } from "./getSingleDirective";

export type ResolverMap<TSource, TContext, TArgs = any> = (
  r: GraphQLFieldResolver<TSource, TContext, TArgs>
) => GraphQLFieldResolver<TSource, TContext, TArgs>;

export function mapSingleDirective<TSource, TContext, TArgs = any>(
  resolveMap: ResolverMap<TSource, TContext, TArgs>,
  schema: GraphQLSchema,
  node: GraphQLFieldConfig<TSource, TContext, TArgs>,
  directiveName: string,
  pathToDirectivesInExtensions?: string[]
) {
  const directive = getSingleDirective(
    schema,
    node,
    directiveName,
    pathToDirectivesInExtensions
  );

  if (directive) {
    // Get this field's original resolver
    const resolve = getResolver<TSource, TContext, TArgs>(node);

    // Replace the original resolver with a function that *first* replaces the node with the identifier
    // and then performs the standard resolution actions
    node.resolve = resolveMap(resolve);
  }

  return node;
}
