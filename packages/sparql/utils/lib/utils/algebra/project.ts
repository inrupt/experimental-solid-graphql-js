//
// Copyright 2022 Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
import { Term } from "@rdfjs/types";
import { DataFactory as DF } from "n3";
import { Algebra } from "sparqlalgebrajs";
import { RDFS_LABEL } from "../terms";
import { factory } from "./factory";

/**
 * Get the objects of a given subject-predicate pattern
 */
export function objectPattern(
  subject: Term,
  predicate: Term,
  distinct = false
): Algebra.Project {
  const object = DF.variable("o");
  const pattern = factory.createPattern(subject, predicate, object);
  return factory.createProject(
    distinct ? factory.createDistinct(pattern) : pattern,
    [object]
  );
}

/**
 * Gets the label of a subject
 */
export function labelPattern(subject: Term, distinct?: boolean) {
  return objectPattern(subject, DF.namedNode(RDFS_LABEL), distinct);
}
