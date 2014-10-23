var AssetGraph = require('assetgraph-builder'),
    urlTools = require('urltools');

/* AssetGraph middlware for MetalSmith
 * 
 * options.root = root of src folder
 */
function metalSmithAssetGraph (options) {
    if (!options || !options.root) {
        throw new Error('metalsmith-assetgraph: you must provide the root of the source folder in options.root');
    }

    return function (files, metalsmith, done) {
        new AssetGraph({root: options.root})
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
    };
}

module.exports = metalSmithAssetGraph;

