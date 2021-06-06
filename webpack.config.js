const path = require('path');

module.exports = {
    context: __dirname,
    entry: './src/index.ts',
    output : {
        path: path.resolve(__dirname, 'dist'),
        filename: 'reaksi.js',
        library: 'Reaksi',
        libraryTarget: 'umd',
        globalObject: 'this',
        umdNamedDefine: true
    },
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            }
        ]
    },
    resolve: {
        extensions: ['.ts','.tsx','.js']
    }
};