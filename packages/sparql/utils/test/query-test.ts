import { QueryEngine } from '@comunica/query-sparql';
import { Store, DataFactory as DF } from 'n3';
import { type IQueryContext, type ISparqlEngine, queryObject, isType, queryLabel, queryObjects } from '../lib';
import { QueryContext } from '@rdfjs/types';

describe('Test Query Utilities against @comunica/query-sparql', () => {
  let sparqlEngine: ISparqlEngine;
  let context: QueryContext;
  let options: IQueryContext;
  let source: Store;
  
  beforeEach(() => {
    source = new Store([
      DF.quad(
        DF.namedNode('http://example.org#Jesse'),
        DF.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
        DF.namedNode('http://example.org#Person')
      )
    ])
    sparqlEngine = new QueryEngine();
    context = {
      sources: [source]
    };
    options = { sparqlEngine, context };
  });

  describe('isType', () => {
    it('Jesse should be a person', () => {
      return expect(
        isType(options, DF.namedNode('http://example.org#Jesse'), DF.namedNode('http://example.org#Person'))
      ).resolves.toBe(true);
    });

    it('Jesse should not be an animal', () => {
      return expect(
        isType(options, DF.namedNode('http://example.org#Jesse'), DF.namedNode('http://example.org#Animal'))
      ).resolves.toBe(false);
    });
  });

  describe('queryLabel', () => {
    it('should reject when no labels are present', () => {
      return expect(
        queryLabel(options, DF.namedNode('http://example.org#Jesse'))
      ).rejects.toThrowError();
    });

    it('should reject when more than one labels are present', () => {
      source.addQuads([
        DF.quad(
          DF.namedNode('http://example.org#Jesse'),
          DF.namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
          DF.literal('Jesse')
        ),
        DF.quad(
          DF.namedNode('http://example.org#Jesse'),
          DF.namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
          DF.literal('jeswr')
        )
      ]);
  
      return expect(
        queryLabel(options, DF.namedNode('http://example.org#Jesse'))
      ).rejects.toThrowError();
    });

    it('should return the label when exactly one label is present', () => {
      source.addQuads([
        DF.quad(
          DF.namedNode('http://example.org#Jesse'),
          DF.namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
          DF.literal('Jesse')
        )
      ]);

      return expect(
        queryLabel(options, DF.namedNode('http://example.org#Jesse'))
      ).resolves.toEqual(DF.literal('Jesse'));
    });
  });

  describe('queryObject', () => {
    it('should resolve when single object is present', () => {
      return expect(
        queryObject(
          options,
          DF.namedNode('http://example.org#Jesse'),
          DF.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type')
        )
      ).resolves.toEqual(
        DF.namedNode('http://example.org#Person')
      );
    });

    it('should reject when no objects are present', () => {
      source.delete(
        DF.quad(
          DF.namedNode('http://example.org#Jesse'),
          DF.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
          DF.namedNode('http://example.org#Person')
        )
      )
  
      return expect(
        queryObject(
          options,
          DF.namedNode('http://example.org#Jesse'),
          DF.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
        )
      ).rejects.toThrowError();
    });

    it('should reject when more than one objects are present', () => {
      source.add(
        DF.quad(
          DF.namedNode('http://example.org#Jesse'),
          DF.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
          DF.namedNode('http://example.org#Agent')
        )
      )
  
      return expect(
        queryObject(
          options,
          DF.namedNode('http://example.org#Jesse'),
          DF.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type')
        )
      ).rejects.toThrowError();
    });
  });

  describe('queryObjects', () => {
    it('should resolve when single object is present', () => {
      return expect(
        queryObjects(
          options,
          DF.namedNode('http://example.org#Jesse'),
          DF.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type')
        )
      ).resolves.toEqual(
        [DF.namedNode('http://example.org#Person')]
      );
    });

    it('should resolve when no objects are present', () => {
      source.delete(
        DF.quad(
          DF.namedNode('http://example.org#Jesse'),
          DF.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
          DF.namedNode('http://example.org#Person')
        )
      )
  
      return expect(
        queryObjects(
          options,
          DF.namedNode('http://example.org#Jesse'),
          DF.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type')
        )
      ).resolves.toEqual([]);
    });

    it('should resolve when more than one objects are present', () => {
      source.add(
        DF.quad(
          DF.namedNode('http://example.org#Jesse'),
          DF.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
          DF.namedNode('http://example.org#Agent')
        )
      )
  
      return expect(
        queryObjects(
          options,
          DF.namedNode('http://example.org#Jesse'),
          DF.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type')
        )
      ).resolves.toEqual([
        DF.namedNode('http://example.org#Person'),
        DF.namedNode('http://example.org#Agent')
      ]);
    });
  });
});
