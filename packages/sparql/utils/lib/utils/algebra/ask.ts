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
import type { Term } from "@rdfjs/types";
import { DataFactory as DF } from "n3";
import type { Algebra } from "sparqlalgebrajs";
import { RDF_TYPE } from "../terms";
import { factory } from "./factory";

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
