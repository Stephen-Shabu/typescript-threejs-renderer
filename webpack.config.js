const path = require('path');

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
    }
};
