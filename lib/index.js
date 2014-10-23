var AssetGraph = require('assetgraph-builder'),
    urlTools = require('urltools'),
    Path = require('path');

/* AssetGraph middlware for MetalSmith
 * 
 * options.root = root of src folder
 */
function metalSmithAssetGraph(options) {
    options = options || {};
    return function (files, metalsmith, done) {
        options.root = Path.resolve(metalsmith._directory, metalsmith._source);
        new AssetGraph(options)
        .registerRequireJsConfig()
        .loadAssets(Object.keys(files).map(function (path) {
            var file = files[path];
            delete files[path];
            return {
                url: path,
                rawSrc: file.contents
            };
        }))
        .buildProduction(options)
        .queue(function (assetGraph) {
            assetGraph.findAssets({isLoaded: true, isInline: false}).forEach(function (asset) {
                files[urlTools.buildRelativeUrl(assetGraph.root, asset.url)] = {contents: asset.rawSrc};
            });
        })
        .run(done);
    };
}

module.exports = metalSmithAssetGraph;

