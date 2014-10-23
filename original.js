var Metalsmith = require('metalsmith'),
    markdown = require('metalsmith-markdown'),
    permalinks = require('metalsmith-permalinks'),
    templates = require('metalsmith-templates'),
    AssetGraph = require('assetgraph-builder'),
    urlTools = require('urltools');

Metalsmith(__dirname)
    .source('src')
    .destination('outroot')
    .use(markdown())
    .use(permalinks(':title'))
    .use(templates({
        engine: 'swig',
        directory: '_layouts'
    }))
    .use(function (files, metalsmith, done) {
        new AssetGraph({root: 'src'})
        .registerRequireJsConfig()
        .loadAssets(Object.keys(files).map(function (path) {
            var file = files[path];
            delete files[path];
            return {
                url: path,
                rawSrc: file.contents
            };
        }))
        .buildProduction()
        .queue(function (assetGraph) {
            assetGraph.findAssets({isLoaded: true, isInline: false}).forEach(function (asset) {
                files[urlTools.buildRelativeUrl(assetGraph.root, asset.url)] = {contents: asset.rawSrc};
            });
        })
        .run(done);
    })
    .build();

