var expect = require('unexpected');
var assetGraph = require('../lib/index');
var Metalsmith = require('metalsmith');
var Path = require('path');
var rimraf = require('rimraf');
var glob = require('glob');
var fs = require('fs');
var async = require('async');

describe('metalsmith-assetgraph', function () {
    describe('basic', function () {
        it('should export a function', function () {
            expect(assetGraph, 'to be a function');
        });
        it('should return a function of arity 3', function () {
            var middleware = assetGraph({root: 'src'});
            expect(middleware, 'to be a function');
            expect(middleware, 'to have length', 3);
        });
    });
    describe('test cases', function () {
        function deleteBuildFolder(done) {
            rimraf(Path.resolve(__dirname, 'build'), done);
        }
        before(deleteBuildFolder);
        after(deleteBuildFolder);
        function readTestData(path, callback) {
            glob(path + '/**.*', function (err, files) {
                if (err) {
                    return callback(err, null);
                }
                var result = {};
                async.each(files, function (file, done) {
                    fs.readFile(file, 'utf-8', function (err, data) {
                        result[file.replace(path, '')] = data;
                        done(err);
                    });
                }, function (err) {
                    callback(err, result);
                });
            });
        }
        [
            'singlePageWithTwoCssFiles',
            'twoPagesWithOneSharedCssFile'
        ].forEach(function (testCase) {
            it(testCase, function (done) {
                this.timeout(10000);
                readTestData(Path.resolve(__dirname, 'fixtures', testCase, 'expected'), function (err, expectedData) {
                    var m = Metalsmith(__dirname);
                    m.source('fixtures/' + testCase + '/src')
                    m.destination('build/' + testCase);
                    m.use(assetGraph({
                        version: 'testFixture'
                    }));
                    m.build(function (err) {
                        expect(err, 'to be null');
                        readTestData(Path.resolve(__dirname, 'build', testCase), function (err, actualData) {
                            expect(expectedData, 'to equal', actualData);
                            done();
                        });
                    });
                });
            });
        });
    });
});
