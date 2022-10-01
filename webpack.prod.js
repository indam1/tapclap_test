/* eslint-disable import/no-extraneous-dependencies */
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const TerserWebpackPlugin = require('terser-webpack-plugin');

module.exports = merge(common, {
    mode: 'production',
    optimization: {
        minimizer: [
            new TerserWebpackPlugin({
                cache: true,
                parallel: true,
                sourceMap: true,
            }),
        ],
    },
    devtool: 'source-map',
});
