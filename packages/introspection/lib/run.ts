
import { readJSONSync } from 'fs-extra';
import { GraphQLFieldConfig, GraphQLObjectType, GraphQLSchema, GraphQLString, Kind, ThunkObjMap,  } from 'graphql';
import { ObjMap } from 'graphql/jsutils/ObjMap';
import { printSchemaWithDirectives } from "@graphql-tools/utils";

interface RunResult {
  classes: Record<string, { name: string, properties: string[]; description?: string }>;
  properties: Record<string, { name: string, classes: string[]; description?: string }>;
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

function is(c: string) {
  return createAst("is", { class: c });
}


export function createGraphql({ classes, properties }: RunResult) {
  const graphqlObjects: Record<string, GraphQLObjectType> = {};
  const globalFields: Record<string, GraphQLFieldConfig<any, any, any>> = {};

  for (const iri in classes) {
    const { properties: classProperties, name, description} = classes[iri];
    const fields: ThunkObjMap<GraphQLFieldConfig<any, any, any>> = {};

    for (const property of classProperties) {
      const { name, description } = properties[property];
      // @ts-ignore
      fields[name] = globalFields[property] ??= { astNode: propertyDirective(property), description: description?.trim(), };
    }

    graphqlObjects[iri] = new GraphQLObjectType({
      name,
      fields,
      description: description?.trim(),
      astNode: is(iri),
    })
  }

  for (const property in globalFields) {
    let { classes } = properties[property];

    if (classes.length > 1) {
      throw new Error(`Multiple classes not supported [${classes.join(',')}] on [${property}]`)
    } else if (classes.length === 0) {
      // WARNING: This is a massive hack
      classes = ["http://www.w3.org/2000/01/rdf-schema#Literal"]
    }

    const [range] = classes;

    globalFields[property].type = range === "http://www.w3.org/2000/01/rdf-schema#Literal" ?
      GraphQLString :
       graphqlObjects[range];
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

// const g = createGraphql(
//   // readJSONSync('./runResults.json')
//   readJSONSync('./result4.json')
// )

// console.log(
//   printSchemaWithDirectives(g)
// )

