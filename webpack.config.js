// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable */
const path = require('path');
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
/* eslint-enable */

const app = 'meeting';

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      inlineSource: '.(js|css)$',
      template: __dirname + `/app/${app}.html`,
      filename: __dirname + `/dist/${app}.html`,
      inject: 'head',
    }),
    new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [new RegExp(`${app}`)]),
  ],
  entry: [`./src/index.tsx`],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: `${app}-bundle.js`,
    publicPath: '/',
    libraryTarget: 'var',
    library: `app_${app}`,
  },
  resolve: {
    extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js'],
    fallback: {
      fs: false,
      tls: false,
    },
  },
  module: {
    rules: [
      {
        test: /\.(tsx|ts)?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  devServer: {
    historyApiFallback: {
      index: `/${app}.html`,
    },
    proxy: {
      context: ['/join', '/attendee', '/meeting', '/logs', '/end'],
      target: 'http://127.0.0.1:8080',
    },
    compress: true,
    hot: false,
    host: '0.0.0.0',
    port: 9000,
    https: true,
    open: true,
  },
  performance: {
    hints: false,
  },
  mode: 'production',
  devtool: false,
};
