var expect = require('unexpected');
var assetGraph = require('../lib/index');

describe('metalsmith-assetgraph', function () {
    describe('basic', function () {
        it('should export a function', function () {
            expect(assetGraph, 'to be a function');
        });
        it('should throw an exception if required options is not provided', function () {
            expect(function () {
                assetGraph();
            }, 'to throw', 'metalsmith-assetgraph: you must provide the root of the source folder in options.root');
        });
        it('should return a function of arity 3', function () {
            var middleware = assetGraph({root: 'src'});
            expect(middleware, 'to be a function');
            expect(middleware, 'to have length', 3);
        });
    });
});
