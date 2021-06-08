const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    context: __dirname,
    entry: './src/index.ts',
    output : {
        path: path.resolve(__dirname, 'dist'),
        filename: 'reaksi.js',
        library: {
            name: 'Reaksi',
            type: 'umd'
        },
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
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    keep_classnames: true,
                    keep_fnames: true
                },
                extractComments:false
            })
        ]

    }
};