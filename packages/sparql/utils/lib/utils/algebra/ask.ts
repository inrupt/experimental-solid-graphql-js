import { Algebra, Factory } from 'sparqlalgebrajs';
import { RDFS_LABEL, RDF_TYPE } from '../terms';
import { DataFactory as DF } from 'n3';
import { Term } from '@rdfjs/types';
import { factory } from './factory';

/**
 * Create an ask query to check if a pattern exists
 */
function askPattern(subject: Term, predicate: Term, object: Term): Algebra.Ask {
  return factory.createAsk(factory.createPattern(subject, predicate, object));
}

/**
 * Create an ask query to check if a subject is of a certain type
 */
export function askType(subject: Term, type: Term): Algebra.Ask {
  return askPattern(subject, DF.namedNode(RDF_TYPE), type);
}
