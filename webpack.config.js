const path = require('path');
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports =
{
    mode: "development",

    experiments:
    {
        asyncWebAssembly: true,
        syncWebAssembly: true,
        topLevelAwait: true
    },

    entry: './src/index.ts',
    output:
    {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
        assetModuleFilename: "assets/[hash][ext][query]",
    },
    module:
    {
        rules:
            [
                {
                    test: /\.ts$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
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
                    { from: "src/assets", to: "assets" }
                ]
            }),
            new HtmlWebpackPlugin({
                template: './src/index.html',
                filename: 'index.html'
            })
        ],
    resolve:
    {
        extensions: [".ts", ".js"],
    },

    target: 'web',

    devServer:
    {
        static: './dist',
        port: 8080,
        hot: true
    }
};
