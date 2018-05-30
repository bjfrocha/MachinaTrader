const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const bundleOutputDir = './wwwroot/dist'

function resolve(dir) {
  return path.join(__dirname, '.', dir)
}

module.exports = (env, argv) => {
  console.log('Building for \x1b[33m%s\x1b[0m', process.env.NODE_ENV)

  const isDevBuild = !(process.env.NODE_ENV && process.env.NODE_ENV === 'production')
  const extractCSS = new ExtractTextPlugin('site.css')

  return [{
    // Redundant, but from Dotnet the mode cannot be set at command line.
    mode: argv && argv.mode ? argv.mode : (isDevBuild ? 'development' : 'production'),
    stats: { modules: false },
    entry: { 'main': './ClientApp/main.js' },
    resolve: {
      extensions: ['.js', '.vue'],
      alias: isDevBuild ? {
        'vue$': 'vue/dist/vue',
        '@': resolve('ClientApp')
      } : {
        '@': resolve('ClientApp')
      }
    },
    output: {
      path: path.join(__dirname, bundleOutputDir),
      filename: '[name].js',
      publicPath: '/dist/'
    },
    module: {
      rules: [
        { test: /\.vue$/, include: /ClientApp/, use: 'vue-loader' },
        { test: /\.js$/, include: /ClientApp/, use: 'babel-loader' },
        { test: /\.css$/, use: isDevBuild ? ['style-loader', 'css-loader'] : ExtractTextPlugin.extract({ use: 'css-loader' }) },
        { test: /\.(png|jpg|jpeg|gif|svg)$/, use: 'url-loader?limit=25000' },
        { test: /\.(woff2?|eot|ttf|otf)$/, use: 'url-loader?limit=25000' }
      ]
    },
    plugins: [
      new webpack.DllReferencePlugin({
        context: __dirname,
        manifest: require('./wwwroot/dist/vendor-manifest.json')
      })
    ].concat(isDevBuild ? [
      // Plugins that apply in development builds only
      // new webpack.SourceMapDevToolPlugin({
      //   filename: '[file].map', // Remove this line if you prefer inline source maps
      //   moduleFilenameTemplate: path.relative(bundleOutputDir, '[resourcePath]') // Point sourcemap entries to the original file locations on disk
      // })
    ] : [
      // Plugins that apply in production builds only
      // new webpack.optimize.UglifyJsPlugin(), // Updated to an option
      extractCSS,
      // Compress extracted CSS.
      new OptimizeCSSPlugin({
        cssProcessorOptions: {
          safe: true
        }
      })
    ]),
    devtool: isDevBuild ? 'source-map' : false
  }]
}