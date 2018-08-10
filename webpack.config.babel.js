import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import WebpackMd5Hash from 'webpack-md5-hash';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CleanWebpackPlugin from 'clean-webpack-plugin';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import { HotModuleReplacementPlugin, WatchIgnorePlugin } from 'webpack';

const isProd = process.env.NODE_ENV === 'production';

const webpackConfig = {
  target: 'web',
  devtool: isProd ? 'none' : 'eval',
  mode: isProd ? 'production' : 'development',
  entry: {
    main: [path.resolve(__dirname, 'app/index.jsx' || 'app/index.js')]
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: isProd ? '[name]-[chunkhash].js' : '[name].bundle.js',
    chunkFilename: isProd ? '[name]-[chunkhash].js' : '[name].bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.(html|xhtml)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'html-loader',
            options: { minimize: true }
          }
        ]
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [
          isProd ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          isProd ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader',
          'postcss-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 3000
            }
          }
        ]
      }
    ]
  },
  resolve: {
    modules: ['./node_modules', './app'],
    extensions: ['.js', '.jsx', '.json', '.scss', '.css', '.vue']
  },
  devServer: {
    port: process.env.PORT || 9000,
    host: process.env.HOST || 'localhost',
    contentBase: path.resolve(__dirname, 'dist'),
    compress: true,
    hot: true,
    inline: true,
    open: true,
    progress: true,
    overlay: !isProd,
    watchOptions: {
      ignored: /node_modules/,
      aggregateTimeout: 500,
      poll: true
    }
  },
  performance: {
    hints: isProd ? 'error' : 'warning',
    maxAssetSize: 300000
  },
  optimization: {
    minimize: isProd,
    minimizer: [new UglifyJsPlugin()],
    nodeEnv: isProd ? 'production' : 'development',
    noEmitOnErrors: false,
    namedModules: !isProd,
    splitChunks: {
      chunks: 'all',
      minSize: 30000,
      maxSize: 0,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      name: true,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  },
  plugins: [
    new WebpackMd5Hash(),
    new CleanWebpackPlugin('dist', {}),
    new MiniCssExtractPlugin({
      filename: isProd ? '[name]-[contenthash].css' : '[name].bundle.css'
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'app/index.html'),
      filename: 'index.html',
      cache: isProd,
      inject: true,
      hash: isProd
    }),
    new UglifyJsPlugin({
      uglifyOptions: {
        compress: {
          drop_console: isProd,
          warnings: !isProd
        }
      }
    }),
    new WatchIgnorePlugin([path.resolve(__dirname, 'node_modules')])
  ]
};

if (!isProd) {
  webpackConfig.plugins.push(new HotModuleReplacementPlugin());
}

module.exports = webpackConfig;