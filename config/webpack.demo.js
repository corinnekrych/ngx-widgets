const helpers = require('./helpers');
const webpack = require('webpack');
const path = require('path');

/**
 * Webpack Plugins
 */
const AotPlugin = require('@ngtools/webpack').AngularCompilerPlugin;
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ContextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeJsPlugin = require('optimize-js-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const TypedocWebpackPlugin = require('typedoc-webpack-plugin');


// NOTE: AOT is temporarily disabled because mini-css-extract-plugin has an issue with AngularCompilerPlugin
// See: https://github.com/webpack-contrib/mini-css-extract-plugin/issues/186
// const aotMode = false;

module.exports = {
  devServer: {
    historyApiFallback: true,
    stats: 'minimal',
    inline: true
  },

  /**
   * As of Webpack 4 we need to set the mode.
   * Since this is a library and it uses gulp to build the library,
   * we only have Demo, Test, and Perf.
   */
  mode: 'development',

  devtool: 'cheap-module-eval-source-map',

  entry: {
    'polyfills': './src/polyfills.ts',
    'vendor': './src/vendor.ts',
    'app': './src/main.ts'
  },

  resolve: {
    extensions: ['.webpack.js', '.wep.js', '.js', '.ts']
  },

  stats: {
    colors: true,
    reasons: true
  },

  module: {
    rules: [
      // {
      //   test: /\.ts$/,
      //   enforce: 'pre',
      //   use: [{
      //     loader: 'tslint-loader',
      //     options: {
      //       emitErrors: false,
      //       failOnHint: false,
      //       resourcePath: 'src',
      //       typeCheck: true,
      //     }
      //   }],
      //   exclude: [helpers.root('node_modules')]
      // },

      {
        test: /\.ts$/,
        loaders: [
          'ts-loader',
          'angular2-template-loader'
        ],
        exclude: [/\.(spec|e2e)\.ts$/]
      },

      /* Raw loader support for *.html
       * Returns file content as string
       *
       * See: https://github.com/webpack/raw-loader
       */
      {
        test: /\.html$/,
        use: ['html-loader']
      },
      /*
       * to string and css loader support for *.css files
       * Returns file content as string
       *
       */
      // {
      //   test: /\.css$/,
      //   use: [
      //     MiniCssExtractPlugin.loader, {
      //       loader: "css-loader",
      //       options: {
      //         minimize: true,
      //         sourceMap: true
      //       }
      //     }]
      // },
      {
        test: /\.less$/,
        use: [
          // {
          //   loader: MiniCssExtractPlugin.loader,
          //   options: {
          //     minimize: true,
          //     sourceMap: true
          //   }
          // },
          'css-to-string-loader',
          {
            loader: 'css-loader',
            options: {
              minimize: true,
              sourceMap: true,
              context: '/'
            }
          },
          {
            loader: 'less-loader',
            options: {
              paths: [
                path.resolve(__dirname, "../node_modules/patternfly/dist/less"),
                path.resolve(__dirname, "../node_modules/patternfly/dist/less/dependencies"),
                path.resolve(__dirname, "../node_modules/patternfly/dist/less/dependencies/bootstrap"),
                path.resolve(__dirname, "../node_modules/patternfly/dist/less/dependencies/font-awesome"),
              ],
              sourceMap: true
            }
          }
        ]
      },

    ]
  },

  output: {
    path: helpers.root('dist-demo'),
    publicPath: '/',
    filename: '[name].js',
    chunkFilename: '[id].chunk.js',
    sourceMapFilename: '[name].map'
  },

  plugins: [

    /*
     * StyleLintPlugin
     */
    new StyleLintPlugin({
      configFile: '.stylelintrc',
      syntax: 'less',
      context: 'src',
      files: '**/*.less',
      failOnError: true,
      quiet: false,
    }),

    /**
     * Plugin: ContextReplacementPlugin
     * Description: Provides context to Angular's use of System.import
     *
     * See: https://webpack.github.io/docs/list-of-plugins.html#contextreplacementplugin
     * See: https://github.com/angular/angular/issues/11580
     */
    new ContextReplacementPlugin(
      // The (\\|\/) piece accounts for path separators in *nix and Windows
      // /angular(\\|\/)core(\\|\/)@angular/,
      /\@angular(\\|\/)core(\\|\/)fesm5/,
      helpers.root('./src')
    ),
    new ContextReplacementPlugin(
      // The (\\|\/) piece accounts for path separators in *nix and Windows
      /angular(\\|\/)core(\\|\/)@angular/,
      helpers.root('./src')
    ),

    /*
     * Plugin: HtmlWebpackPlugin
     * Description: Simplifies creation of HTML files to serve your webpack bundles.
     * This is especially useful for webpack bundles that include a hash in the filename
     * which changes every compilation.
     *
     * See: https://github.com/ampedandwired/html-webpack-plugin
     */
    new HtmlWebpackPlugin({
      chunksSortMode: 'dependency',
      template: 'src/index.html'
    }),

    // // Todo: config is not loading.
    // new TsConfigPathsPlugin({
    //   configFileName: helpers.root("tsconfig-demo.json")
    // }),

  ],

  /**
   * These common plugins were removed from Webpack 3 and are now set in this object.
   */
  optimization: {
    namedModules: true, // NamedModulesPlugin()
    splitChunks: { // CommonsChunkPlugin()
      name: 'all'
    },
    noEmitOnErrors: true, // NoEmitOnErrorsPlugin
    concatenateModules: true //ModuleConcatenationPlugin
  },

};
