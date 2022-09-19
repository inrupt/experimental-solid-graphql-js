const RDFS = "http://www.w3.org/2000/01/rdf-schema#"


// TODO: Apply types using a Graphql XSD type mapper
// Use repeatable directives to allow paths in the first instance
// https://archive.topquadrant.com/graphql/graphql-shacl.html
// https://docs.stardog.com/archive/7.8.0/query-stardog/graphql.html#type
// https://docs.stardog.com/archive/7.8.0/query-stardog/graphql.html#reasoning

// I think we should allow Label as both a *type* and as a directive
// I think we should allow ID to have the @identifier behavior applied to it by default
// We should try and build in the @specifiedBy's at some point

const xsdTypeDefs = /* GraphQL */ `
scalar gDay
`;


export const typeDefs = /* GraphQL */ `
directive @property(iri: String!) on FIELD_DEFINITION # Require a singular property
directive @coerceLiteral on FIELD_DEFINITION
directive @identifier on ARGUMENT_DEFINITION | FIELD_DEFINITION
directive @defaultLang(lang: String!, useDefault: Boolean) on SCHEMA

schema 
@defaultLang(lang: "en", useDefault: true)
{
  query: Query
}

type Query {
  person(idf: URL @identifier): Human!
}

scalar URL @specifiedBy(url: "https://tools.ietf.org/html/rfc3986")
scalar 

type Human {
  # TODO: See if inputs must match args - that is the only way this works
  idf: URL! @identifier
  idfgh: URL! @identifier
  label: String @property(iri: "${RDFS}label") @coerceLiteral
  mother: Human @property(iri: "http://example.org/mother")
  motherLabel: String @property(iri: "http://example.org/mother") #@label
  # TODO: Consider enabling full sparql paths inside these properties
  father: Human @property(iri: "http://example.org/father")
}
`;


