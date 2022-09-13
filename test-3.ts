import { makeExecutableSchema } from '@graphql-tools/schema'
import { graphql, buildSchema } from 'graphql';
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

// Construct a schema, using GraphQL schema language
const typeDefs = /* GraphQL */ `
  directive @is(class: String!) on OBJECT
  directive @property(iri: String!) on FIELD_DEFINITION

  type Query {
    me(id: String): Human!
  }

  type Human @is(class: "https://example.org/human") {
    id: String!
    label: String! @property(iri: "${RDFS}label")
    mother: Human @property(iri: "http://example.org/mother")
    father: Human @property(iri: "http://example.org/father")
  }
`;

const map = {
  label: `${RDFS}label`,
  mother: "http://example.org/mother",
  father: "http://example.org/father"
}

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

console.log('before making executable schema')

const schema = makeExecutableSchema({
  typeDefs,
})

mapSchema(schema, {
  [MapperKind.FIELD]: (fieldConfig) => {
    console.log(fieldConfig);

    return fieldConfig;
  },
  [MapperKind.OBJECT_FIELD]: (fieldConfig) => {

    const propertyDirective = getDirective(schema, fieldConfig, 'property')?.[0].iri;

    const defaultResolve = fieldConfig.resolve;
    fieldConfig.resolve = (source, args, context, info) => {
      return defaultResolve?.(source, args, { ...context, property: propertyDirective }, info)
    }

    return fieldConfig;

    // fieldConfig.extensions = {
    //   ...fieldConfig.extensions,
    //   ['urn:solidGraphQL:directive:property']: propertyDirective
    // }

    // fieldConfig.resolve()

    // ??= {})['urn:solidGraphQL:directive:property'] = propertyDirective

    // return fieldConfig;

    // if (deprecatedDirective) {

    //   fieldConfig.deprecationReason = deprecatedDirective['reason'];

    //   return fieldConfig;

    // }

  },
  // [MapperKind.FIELD]: field => {
  //   // console.log('field', field, field.astNode?.directives)

  //   const property = field.astNode?.directives
  //     ?.filter(directive => directive.name.kind === 'Name' && directive.name.value === 'property' && directive.arguments?.length === 1)
  //     .map(directive => directive.arguments!)

  //   if (property?.length === 1) {
  //     // TODO: Proper validation here
  //     const [[{ value }]] = property;
  //     console.log(value)
  //   }

  //   // TODO: Finish this mapping properly

  //   return field;
  // }
})

// console.log(getDirectives(schema))

// process.exit();

console.log('after making executable schema')

// Run the GraphQL query '{ hello }' and print out the response
graphql({
  schema,
  source,
  async fieldResolver(source, args, context, info) {

    // const directives = getDirectives(info.schema, info.operation.directives)
    console.log(info.parentType)
    console.log(source, args, context)

    if (!source && args.id)
      return DF.namedNode(args.id)

    // return 's';
    
    const result = await engine.queryObject(source, DF.namedNode(map[info.fieldName as 'mother' | 'father' | 'label']), { sources: [store] })
    
    // console.log(source, args, context, info.returnType)

    // TODO: Make this more general
    if (info.returnType.toString() === 'String!')
      return result.value;

    return result;
    
    // console.log(source, args, context, info.fieldName)

    // if (args.id)
    //   return args.id;
    
    // return 's'
  },
  typeResolver(
    value,
    context,
    info,
    abstractType
    ) {
      console.log('----')
    //   console.log(
    //     value,
    // context,
    // info,
    // abstractType
    //   )
      
      return value.value as any;
  }
  // rootValue
}).then((response) => {
  console.log(JSON.stringify(response, null, 2));
});
