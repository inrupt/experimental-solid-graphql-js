import { Algebra, Factory } from 'sparqlalgebrajs';
import { RDFS_LABEL, RDF_TYPE } from '../terms';
import { DataFactory as DF } from 'n3';
import { Term } from '@rdfjs/types';
import { factory } from './factory';

/**
 * Get the objects of a given subject-predicate pattern
 */
export function objectPattern(subject: Term, predicate: Term, distinct = false): Algebra.Project {
  const object = DF.variable('o');
  const pattern = factory.createPattern(subject, predicate, object);
  return factory.createProject(distinct ? factory.createDistinct(pattern) : pattern, [object]);
}

/**
 * Gets the label of a subject
 */
export function labelPattern(subject: Term, distinct?: boolean) {
  return objectPattern(subject, DF.namedNode(RDFS_LABEL), distinct);
}
