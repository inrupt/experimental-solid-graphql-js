import { GraphQLSchema, GraphQLObjectType, print, GraphQLFieldConfig, GraphQLOutputType, GraphQLAbstractType, ConstDirectiveNode, DirectiveNode } from 'graphql';
import { printSchema, buildSchema, GraphQLDirective, Kind } from 'graphql';

import { DirectiveUsage, makeDirectiveNode, printSchemaWithDirectives, makeDirectiveNodes, mapSchema, MapperKind, getDirective } from '@graphql-tools/utils'
import { makeExecutableSchema, extractExtensionsFromSchema,} from '@graphql-tools/schema'
import { stitchingDirectives, } from '@graphql-tools/stitching-directives' 

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
      description: string;
    }
  },
  description: string;
}

interface PropertyInterface {
  name: string;
  iri: string;
  type: GraphQLOutputType;
}

function createObject({ name, properties, class: c, description }: ObjectInterface) {
  const fields = {};

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

const object = createObject({
  name
})
