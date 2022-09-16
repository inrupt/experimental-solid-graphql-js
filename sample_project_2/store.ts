import { Store, DataFactory as DF } from 'n3';

const RDFS = "http://www.w3.org/2000/01/rdf-schema#"

const JESSE = DF.namedNode("https://id.inrupt.com/jeswr");
const LEANNE = DF.namedNode("https://id.inrupt.com/leanne");
const PAUL = DF.namedNode("https://id.inrupt.com/paul");
const MOTHER = DF.namedNode("http://example.org/mother");
const FATHER = DF.namedNode("http://example.org/father");
const LABEL = DF.namedNode(`${RDFS}label`)

export const store = new Store([
  DF.quad(JESSE, MOTHER, LEANNE),
  DF.quad(JESSE, FATHER, PAUL),
  DF.quad(JESSE, LABEL, DF.literal("Jesse Wright")),
  DF.quad(LEANNE, LABEL, DF.literal("Leanne Wright")),
  DF.quad(PAUL, LABEL, DF.literal("Paul Wright")),
]);
