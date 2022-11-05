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
import {
  GraphQLFieldConfig,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  Kind,
  ThunkObjMap,
} from "graphql";

interface RunResult {
  classes: Record<
    string,
    { name: string; properties: string[]; description?: string }
  >;
  properties: Record<
    string,
    { name: string; classes: string[]; description?: string }
  >;
}

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

function propertyDirective(iri: string) {
  return createAst("property", { iri });
}

function identifierDirective() {
  return createAst("identifier", {});
}

function is(c: string) {
  return createAst("is", { class: c });
}

export function createGraphql({ classes, properties }: RunResult) {
  const graphqlObjects: Record<string, GraphQLObjectType> = {};
  const globalFields: Record<string, GraphQLFieldConfig<any, any, any>> = {};

  for (const iri of Object.keys(classes)) {
    const {
      properties: classProperties,
      name: className,
      description,
    } = classes[iri];
    const fields: ThunkObjMap<GraphQLFieldConfig<any, any, any>> = {
      // @ts-node
      id: {
        astNode: identifierDirective(),
        description: `The URI of the ${className}`,
        type: new GraphQLNonNull(GraphQLID),
      },
    };

    for (const property of classProperties) {
      const { name: propertyName, description: propertyDescription } =
        properties[property];
      // @ts-ignore
      globalFields[property] ??= {
        astNode: propertyDirective(property),
        description: propertyDescription?.trim(),
      };
      fields[propertyName] = globalFields[property];
    }

    graphqlObjects[iri] = new GraphQLObjectType({
      name: className,
      fields,
      description: description?.trim(),
      astNode: is(iri),
    });
  }

  for (const property of Object.keys(globalFields)) {
    let { classes: propertyClasses } = properties[property];

    if (propertyClasses.length > 1) {
      throw new Error(
        `Multiple classes not supported [${propertyClasses.join(
          ","
        )}] on [${property}]`
      );
    } else if (propertyClasses.length === 0) {
      // WARNING: This is a massive hack
      propertyClasses = ["http://www.w3.org/2000/01/rdf-schema#Literal"];
    }

    const [range] = propertyClasses;

    // TODO: Use cardinality information to avoid the need of using a list in *all* cases
    globalFields[property].type = new GraphQLNonNull(
      new GraphQLList(
        new GraphQLNonNull(
          range === "http://www.w3.org/2000/01/rdf-schema#Literal"
            ? GraphQLString
            : graphqlObjects[range]
        )
      )
    );
  }
  // const fields: Record<string, any> = {};

  // for (const key of Object.keys(properties)) {
  //   fields[key] = {
  //     type: properties[key].type,
  //     description: properties[key].description,
  //     astNode: property(properties[key].iri),
  //   };
  // }

  return new GraphQLSchema({
    types: Object.values(graphqlObjects),
  });
}
