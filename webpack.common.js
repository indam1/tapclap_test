/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const ESLintWebpackPlugin = require('eslint-webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { isProduction } = require('webpack-mode');

module.exports = {
    entry: {
        main: ['@babel/polyfill/noConflict', './src/main.js'],
    },
    output: {
        path: path.resolve(__dirname, 'publish'),
    },
    resolve: {
        extensions: ['.js', '.json', '.css'],
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                include: [path.resolve(__dirname, 'src'), path.resolve(__dirname, 'res')],
                exclude: [path.resolve(__dirname, 'node_modules'), path.resolve(__dirname, 'frameworks')],
                loader: 'babel-loader',
            },
            {
                test: /\.(ico|plist|png|jpg|gif|mp3)$/,
                include: [path.resolve(__dirname, 'src'), path.resolve(__dirname, 'res')],
                exclude: [path.resolve(__dirname, 'node_modules'), path.resolve(__dirname, 'frameworks')],
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[hash].[ext]',
                            outputPath: 'assets',
                            publicPath: isProduction ? 'assets' : 'publish/assets',
                        },
                    },
                ],
            },
        ],
    },
    target: 'web',
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendor',
                    chunks: 'all',
                    priority: 1,
                },
                common: {
                    name: 'common',
                    chunks: 'all',
                    minSize: 1,
                    priority: 0,
                },
            },
        },
    },
    plugins: [
        new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
        }),
        new FileManagerPlugin({
            events: {
                onStart: {
                    delete: ['./dist/', './publish/'],
                },
            }
        }),
        new ESLintWebpackPlugin({
            extensions: ['js'],
            exclude: [
                '/node_modules',
                '/frameworks',
            ],
        }),
    ],
};