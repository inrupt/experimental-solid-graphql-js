import { makeExecutableSchema } from '@graphql-tools/schema'
import { graphql, buildSchema, GraphQLSchema } from 'graphql';
import gql from 'graphql-tag'
// import { SolidGraphQLClient } from './src/solidGraphqlClient';
import { SparqlEngine } from './src/sparqlEngine';
import { QueryEngine } from '@comunica/query-sparql';
import { Store, DataFactory as DF } from 'n3';
import { mapSchema, MapperKind, getDirective } from '@graphql-tools/utils';

const engine = new SparqlEngine(
  new QueryEngine()
)

const RDFS = "http://www.w3.org/2000/01/rdf-schema#"

const JESSE = DF.namedNode("https://id.inrupt.com/jeswr");
const LEANNE = DF.namedNode("https://id.inrupt.com/leanne");
const PAUL = DF.namedNode("https://id.inrupt.com/paul");
const MOTHER = DF.namedNode("http://example.org/mother");
const FATHER = DF.namedNode("http://example.org/father");
const LABEL = DF.namedNode(`${RDFS}label`)

const store = new Store([
  DF.quad(JESSE, MOTHER, LEANNE),
  DF.quad(JESSE, FATHER, PAUL),
  DF.quad(JESSE, LABEL, DF.literal("Jesse Wright")),
  DF.quad(LEANNE, LABEL, DF.literal("Leanne Wright")),
  DF.quad(PAUL, LABEL, DF.literal("Paul Wright")),
]);

const typeDefs = /* GraphQL */ `
  # TODO: Work out how to add a boolean validate parameter to the
  # is directive so that we can toggle whether or not the element
  # belongs to the asserted classes.
  directive @is(class: String!) on OBJECT
  directive @property(iri: String!) on FIELD_DEFINITION

  type Query {
    me(id: String): Human!
  }

  type Human @is(class: "https://example.org/human"#, validate: false
    ) {
    id: String!
    label: String! @property(iri: "${RDFS}label")
    mother: Human @property(iri: "http://example.org/mother")
    father: Human @property(iri: "http://example.org/father")
  }
`;


const source = /* GraphQL */ `
  {
    me(id: "https://id.inrupt.com/jeswr") {
      label,
      mother {
        label
      },
      father {
        label
      }
    }
  }
`


let schema = makeExecutableSchema({
  typeDefs,
})

async function fieldResolver(source: any, args: any, context: any, info: any) {
    if (!source && args.id)
      return DF.namedNode(args.id)

    // return 's';
    
    const result = await engine.queryObject(source, DF.namedNode(context.iri), { sources: [store] })
    
    // console.log(source, args, context, info.returnType)

    // TODO: Make this more general
    if (info.returnType.toString() === 'String!')
      return result.value;

    return result;
    
    // console.log(source, args, context, info.fieldName)

    // if (args.id)
    //   return args.id;
    
    // return 's'
}

function propertyDirective(directiveName: string): (schema: GraphQLSchema) => GraphQLSchema {
  return schema =>
    mapSchema(schema, {
      [MapperKind.OBJECT_FIELD]: fieldConfig => {
        const propertyDirectives = getDirective(schema, fieldConfig, directiveName)
        if (propertyDirectives) {
          if (propertyDirectives.length > 1) {
            throw new Error('At most 1 @property directive allowed')
          }
          if (propertyDirectives.length === 1) {
            const [propertyDirective] = propertyDirectives;
            const resolve = fieldConfig.resolve || fieldResolver;
            fieldConfig = {
              ...fieldConfig,
              extensions: {
                ...fieldConfig.extensions,
                '@myExtension': true
              },
              resolve (source, args, context, info) {
                // Add the property directive to the context
                return resolve(source, args, { ...context, ...propertyDirective }, info);
              }
            }
          }
        }
        return fieldConfig;
      }
    })
}

function createNode(record: Record<string, any>) {
  const entries = Object.entries(record);
  if (entries.length !== 1) {
    throw new Error('Exactly one entry found');
  }
}

// function isDirective(directiveName: string): (schema: GraphQLSchema) => GraphQLSchema {
//   return schema =>
//     mapSchema(schema, {
//       [MapperKind.FIELD]: fieldConfig => {
//         const propertyDirectives = getDirective(schema, fieldConfig, directiveName)
//         if (propertyDirectives) {
//           if (propertyDirectives.length > 1) {
//             throw new Error('At most 1 @property directive allowed')
//           }
//           if (propertyDirectives.length === 1) {
//             const [propertyDirective] = propertyDirectives;
//             const resolve = fieldConfig.resolve || fieldResolver;
//             fieldConfig = {
//               ...fieldConfig,
//               resolve (source, args, context, info) {
//                 // Add the property directive to the context
//                 return resolve(source, args, { ...context, ...propertyDirective }, info);
//               }
//             }
//           }
//         }
//         return fieldConfig;
//       }
//     })
// }




schema = propertyDirective('property')(schema);

graphql({
  schema,
  source,
  fieldResolver,
}).then((response) => {
  console.log(JSON.stringify(response, null, 2));
  console.log(response.data?.)
});

