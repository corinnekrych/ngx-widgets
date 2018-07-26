/**
 * Adapted from angular2-webpack-starter
 */
const webpack = require('webpack');
const helpers = require('./helpers');
const path = require('path');
const stringify = require('json-stringify');

/**
 * Webpack Plugins
 */
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ContextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeJsPlugin = require('optimize-js-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');

const extractCSS = new MiniCssExtractPlugin({
  filename: '[name].css',
  chunkFilename: "[id].css"
});

module.exports = {
  /*
   * Cache generated modules and chunks to improve performance for multiple incremental builds.
   * This is enabled by default in watch mode.
   * You can pass false to disable it.
   *
   * See: http://webpack.github.io/docs/configuration.html#cache
   */
  //cache: false,

  /*
   * The entry point for the bundle
   * Our Angular.js app
   *
   * See: https://webpack.js.org/configuration/entry-context/#entry
   */
  entry: helpers.root('index.ts'),

  devtool: 'inline-source-map',

  /*
   * Options affecting the resolving of modules.
   *
   * See: https://webpack.js.org/configuration/resolve
   */
  resolve: {

    /**
     * An array that automatically resolve certain extensions.
     * Which is what enables users to leave off the extension when importing.
     *
     * See: https://webpack.js.org/configuration/resolve/#resolve-extensions
     */
    extensions: ['.ts', '.js', '.json'],
  },

  // require those dependencies but don't bundle them
  externals: [/^@angular\//, /^rxjs\//],

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
        use: [
          'ts-loader',
          'angular2-template-loader'
        ],
        exclude: [/\.(spec|e2e)\.ts$/]
      },

      /*
       * Json loader support for *.json files.
       *
       * See: https://github.com/webpack/json-loader
       */
      {
        test: /\.json$/,
        type: "javascript/auto",
        use: ['custom-json-loader'],
        exclude: [helpers.root('src/index.html')]
      },

      /* HTML Linter
       * Checks all files against .htmlhintrc
       */
      // {
      //   enforce: 'pre',
      //   test: /\.html$/,
      //   use: {
      //     loader: 'htmlhint-loader',
      //     options: {
      //       configFile: './.htmlhintrc'
      //     }
      //   },
      //   exclude: [/node_modules/]
      // },

      /* Raw loader support for *.html
       * Returns file content as string
       *
       * See: https://github.com/webpack/raw-loader
       */
      {
        test: /\.html$/,
        use: ['html-loader']
      },

      // /*
      //  * to string and css loader support for *.css files
      //  * Returns file content as string
      //  *
      //  */
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
      // {
      //   test: /\.less$/,
      //   use: [{
      //     loader: 'css-to-string-loader'
      //   }, {
      //     loader: 'css-loader',
      //     options: {
      //       minimize: true,
      //       sourceMap: true,
      //       context: '/'
      //     }
      //   }, {
      //     loader: 'less-loader',
      //     options: {
      //       paths: [
      //         path.resolve(__dirname, "../node_modules/patternfly/dist/less"),
      //         path.resolve(__dirname, "../node_modules/patternfly/dist/less/dependencies"),
      //         path.resolve(__dirname, "../node_modules/patternfly/dist/less/dependencies/bootstrap"),
      //         path.resolve(__dirname, "../node_modules/patternfly/dist/less/dependencies/font-awesome"),
      //       ],
      //       sourceMap: true
      //     }
      //   }]
      // },

      /**
       *  File loader for supporting fonts, for example, in CSS files.
       */
      {
        test: /\.woff2?$|\.ttf$|\.eot$|\.svg$/,
        use: [
          {
            loader: "url-loader",
            query: {
              limit: 3000,
              includePaths: [
                path.resolve(__dirname, "../node_modules/patternfly/dist/fonts/")
              ],
              name: 'assets/fonts/[name].[ext]'
            }
          }
        ]
      }, {
        test: /\.jpg$|\.png$|\.gif$|\.jpeg$/,
        use: {
          loader: "url-loader",
          query: {
            limit: 3000,
            name: 'assets/fonts/[name].[ext]'
          }
        },
        exclude: path.resolve(__dirname, "../node_modules/patternfly/dist/fonts/")
      }
    ]
  },

  /*
   * Add additional plugins to the compiler.
   *
   * See: http://webpack.github.io/docs/configuration.html#plugins
   */
  plugins: [
    extractCSS,

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

    /**
     * Webpack plugin to optimize a JavaScript file for faster initial load
     * by wrapping eagerly-invoked functions.
     *
     * See: https://github.com/vigneshshanmugam/optimize-js-plugin
     */
    new OptimizeJsPlugin({
      sourceMap: false
    }),

    new HtmlWebpackPlugin(),

    // Reference: https://github.com/johnagan/clean-webpack-plugin
    // Removes the bundle folder before the build
    new CleanWebpackPlugin(['bundles'], {
      root: helpers.root(),
      verbose: false,
      dry: false
    }),

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
    })
  ],

  /**
   * These common plugins were removed from Webpack 3 and are now set in this object.
   */
  optimization: {
    namedModules: true, // NamedModulesPlugin()
    noEmitOnErrors: true, // NoEmitOnErrorsPlugin
    concatenateModules: true //ModuleConcatenationPlugin
  },

  /**
   * Include polyfills or mocks for various node stuff
   * Description: Node configuration
   *
   * See: https://webpack.github.io/docs/configuration.html#node
   */
  node: {
    global: true,
    crypto: 'empty',
    process: true,
    module: false,
    clearImmediate: false,
    setImmediate: false
  }
};
