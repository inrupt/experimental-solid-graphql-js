import { GraphQLObjectType, GraphQLOutputType, Kind } from 'graphql';

function createDirective(name: string, args: Record<string, string>) {
  const arg = Object.entries(args).map(([ key, value ]) => {
    return {
      kind: Kind.ARGUMENT,
      name: {
        kind: Kind.NAME,
        value: key
      },
      value: {
        kind: Kind.STRING,
        value: value
      }
    }
  })

  return {
    kind: Kind.DIRECTIVE,
    name: {
      kind: Kind.NAME,
      value: name
    },
    arguments: arg
  }
}

function createAst(name: string, args: Record<string, string>): any {
  return { directives: [ createDirective(name, args) ] };
}

function property(iri: string) {
  return createAst('property', { iri });
}

function is(c: string) {
  return createAst('is', { class: c });
}

interface ObjectInterface {
  name: string;
  class: string;
  properties: {
    [key: string]: {
      iri: string;
      type: GraphQLOutputType;
      description?: string;
    }
  },
  description?: string;
}

export function createObject({ name, properties, class: c, description }: ObjectInterface) {
  const fields: Record<string, any> = {};

  for (const key in properties) {
    fields[key] = {
      type: properties[key].type,
      description: properties[key].description,
      astNode: property(properties[key].iri)
    }
  }

  return new GraphQLObjectType({
    name,
    fields,
    description,
    astNode: is(c)
  });
}
