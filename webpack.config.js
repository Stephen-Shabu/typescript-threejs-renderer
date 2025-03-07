const path = require('path');
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports =
{
    experiments:
    {
        asyncWebAssembly: true,
        syncWebAssembly: true,
        topLevelAwait: true
    },

    entry: './dist/index.js',
    output:
    {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
        assetModuleFilename: "assets/[hash][ext][query]",
    },
    module:
    {
        rules:
            [
                {
                    test: /\.(png|jpg|jpeg|gif|svg|mp3|wav|ogg|fbx|glb)$/i,
                    type: 'asset/resource',
                }
            ]
    },
    plugins:
        [
            new CopyWebpackPlugin({
                patterns: [
                    { from: "src/assets", to: "assets" } // Copies everything from src/assets to dist/assets
                ]
            })
        ],
    resolve: {
        extensions: [".ts", ".js"],
    }
};
