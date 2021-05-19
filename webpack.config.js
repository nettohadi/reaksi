const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    context: __dirname,
    entry: './src/index.ts',
    output : {
        path: path.resolve(__dirname, 'public'),
        filename: 'js/reaksi.js',
        publicPath: "/public/",
    },
    devServer: {
        port: 3333,
        contentBase: path.resolve(__dirname, 'public'),
        filename: 'react-clone.js',
    },
    mode: "development",
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
    plugins: [new htmlWebpackPlugin({
        filename: "index.html",
        hash: true,
        publicPath: '/public/',
        template: './src/template/index.html'
    })]
};