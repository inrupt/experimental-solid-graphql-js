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
import { GraphQLObjectType, GraphQLOutputType, Kind } from "graphql";

function createDirective(directiveName: string, args: Record<string, string>) {
  const arg = Object.entries(args).map(([key, value]) => {
    return {
      kind: Kind.ARGUMENT,
      name: {
        kind: Kind.NAME,
        value: key,
      },
      value: {
        kind: Kind.STRING,
        value,
      },
    };
  });

  return {
    kind: Kind.DIRECTIVE,
    name: {
      kind: Kind.NAME,
      value: directiveName,
    },
    arguments: arg,
  };
}

function createAst(directiveName: string, args: Record<string, string>): any {
  return { directives: [createDirective(directiveName, args)] };
}

function property(iri: string) {
  return createAst("property", { iri });
}

function is(c: string) {
  return createAst("is", { class: c });
}

interface ObjectInterface {
  name: string;
  class: string;
  properties: {
    [key: string]: {
      iri: string;
      type: GraphQLOutputType;
      description: string;
    };
  };
  description: string;
}

interface PropertyInterface {
  name: string;
  iri: string;
  type: GraphQLOutputType;
}

function createObject({
  name: objectName,
  properties,
  class: c,
  description,
}: ObjectInterface) {
  const fields: Record<string, any> = {};

  for (const key of Object.keys(properties)) {
    fields[key] = {
      type: properties[key].type,
      description: properties[key].description,
      astNode: property(properties[key].iri),
    };
  }

  return new GraphQLObjectType({
    name: objectName,
    fields,
    description,
    astNode: is(c),
  });
}

// const object = createObject({
//   name
// })
