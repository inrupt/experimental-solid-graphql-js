const RDFS = "http://www.w3.org/2000/01/rdf-schema#"

export const typeDefs = /* GraphQL */ `
directive @property(iri: String!) on FIELD_DEFINITION # Require a singular property
directive @coerceLiteral on FIELD_DEFINITION
directive @identifier on ARGUMENT_DEFINITION | FIELD_DEFINITION

type Query {
  person(idf: URL @identifier): Human!
}

scalar URL @specifiedBy(url: "https://tools.ietf.org/html/rfc3986")

type Human {
  # TODO: See if inputs must match args - that is the only way this works
  idf: URL! @identifier
  idfgh: URL! @identifier
  label: String @property(iri: "${RDFS}label") @coerceLiteral
  mother: Human @property(iri: "http://example.org/mother")
  motherLabel: String @property(iri: "http://example.org/mother") @label
  # TODO: Consider enabling full sparql paths inside these properties
  father: Human @property(iri: "http://example.org/father")
}
`;
