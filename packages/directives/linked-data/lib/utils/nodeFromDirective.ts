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
import { DataFactory } from "n3";

export function nodeFromDirective(
  directive: Record<string, any> | undefined,
  directiveName: string
) {
  if (!directive) {
    throw new Error(
      `@${directiveName} requires exactly one argument, received 0`
    );
  }

  const entries = Object.entries(directive);

  if (
    entries.length !== 1 &&
    !("reverse" in directive) &&
    entries.length !== 2
  ) {
    throw new Error(
      `@${directiveName} requires exactly one argument, received ${entries.length}`
    );
  }

  const [[key, value]] = entries;

  if (typeof value !== "string") {
    throw new Error(
      `@${directiveName} accepts only string values, received ${typeof value}`
    );
  }

  const mapping = {
    iri: DataFactory.namedNode,
  };

  if (key in mapping) {
    return mapping[key as "iri"](value);
  }

  throw new Error(
    `Expected key to be one of ${Object.keys(mapping).join(
      ", "
    )}; received ${key}`
  );
}
