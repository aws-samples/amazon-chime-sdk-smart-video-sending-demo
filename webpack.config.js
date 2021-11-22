// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');
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
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'source-map-loader',
      },
    ],
  },
  devServer: {
    historyApiFallback: true,
    proxy: {
      '/': {
        target: 'http://127.0.0.1:8080',
        bypass: function (req, res, proxyOptions) {
          if (req.headers.accept.indexOf('html') !== -1) {
            console.log('Skipping proxy for browser request.');
            return `/${app}.html`;
          }
        },
      },
      '/join': 'http://127.0.0.1:8080',
      '/attendee': 'http://127.0.0.1:8080',
      '/meeting': 'http://127.0.0.1:8080',
      '/logs': 'http://127.0.0.1:8080',
      '/end': 'http://127.0.0.1:8080',
    },
    devMiddleware: {
      index: `dist/${app}.html`,
    },
    static: {
      publicPath: '/',
    },
    hot: true,
    host: '0.0.0.0',
    port: 9000,
    server: 'https'
  },
  performance: {
    hints: false,
  },
  mode: 'development',
};
