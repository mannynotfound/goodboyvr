import clioutput from './devel/utils/clioutput';
import path from 'path';
import fs from 'fs';
import Webpack from 'webpack';
import precss from 'precss';
import autoprefixer from 'autoprefixer';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import StyleLintPlugin from 'stylelint-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import helpers from './devel/utils/helpers';

const argv = helpers.parseArguments(process.argv.slice(2));
const isDevel = process.env.NODE_ENV !== 'production' && !argv['env.production'];
const isProduction = !isDevel;
const isHot = argv['hot'] || false;
const src = path.resolve(process.cwd(), 'src');
const build = path.resolve(process.cwd(), 'build');
const jsDir = path.resolve(build, 'js');
const cssDir = path.resolve(build, 'css');
const vendorDir = path.resolve(build, 'vendors');
const publicPath = '/';

const devPlugins = () => {
  if (!isDevel) { return []; }

  clioutput.hr();
  const vendorManifest = path.resolve(vendorDir, 'vendors.manifest.json');
  const indexHTML = path.resolve(src, 'index.html');

  // Check that vendor manifest exists
  if (!fs.existsSync(vendorManifest)) {
    clioutput.error('Vendor manifest json is missing.');
    clioutput.error('Please run `npm run vendor:perf`');
    process.exit(0);
  }

  // Check that main index.html exits
  if (!fs.existsSync(indexHTML)) {
    clioutput.error('src/index.html is missing.');
    process.exit(0);
  }

  clioutput.info('starting...');

  return [
    new Webpack.DllReferencePlugin({
      context: process.cwd(),
      manifest: require(vendorManifest)
    }),

    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
      true: true,
      xhtml: true,
    }),
  ];
};

const hotPlugins = isHot ? [
  new Webpack.HotModuleReplacementPlugin({
    multiStep: false,
  }),
] : [];

const prodPlugins = isProduction ? [
  new Webpack.optimize.CommonsChunkPlugin({
    names: ['vendors', 'manifest'],
  }),

  new HtmlWebpackPlugin({
    template: './index.html',
    inject: 'head',
    chunksSortMode: 'dependency',
    xhtml: true,
    minify: {
      removeComments: true,
      collapseWhitespace: true,
      removeRedundantAttributes: true,
      useShortDoctype: true,
      removeEmptyAttributes: true,
      removeStyleLinkTypeAttributes: true,
      keepClosingSlash: true,
      minifyJS: true,
      minifyCSS: true,
      minifyURLs: true,
    },
  }),

  new Webpack.LoaderOptionsPlugin({
    minimize: true,
    debug: false,
    quiet: true
  }),

  new Webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false,
      screw_ie8: true,
      conditionals: true,
      unused: true,
      comparisons: true,
      sequences: true,
      dead_code: true,
      evaluate: true,
      if_return: true,
      join_vars: true,
    },
    output: {
      comments: false
    },
    sourceMap: true
  }),
] : [];


const cssRules = isHot ? [
  {
    test: /\.css$/,
    include: [
      src,
      path.resolve(process.cwd(), 'node_modules')
    ],
    use: [
      'raw-loader',
      { loader: 'style-loader', options: { sourceMap: true } },
      { loader: 'css-loader', options: { sourceMap: true } },
      { loader: 'postcss-loader', options: { sourceMap: true } },
      'resolve-url-loader',
    ]
  },
  {
    test: /\.scss$/,
    include: [
      src,
      path.resolve(process.cwd(), 'node_modules')
    ],
    use: [
      { loader: 'style-loader', options: { sourceMap: true } },
      { loader: 'css-loader', options: { sourceMap: true } },
      { loader: 'postcss-loader', options: { sourceMap: true } },
      'resolve-url-loader',
      { loader: 'sass-loader', options: { sourceMap: true } }
    ]
  },
] : [
  {
    test: /\.css$/,
    include: [
      src,
      path.resolve(process.cwd(), 'node_modules')
    ],
    use: ExtractTextPlugin.extract({
      fallback: 'style-loader',
      use: [
        { loader: 'css-loader', options: { sourceMap: true } },
        { loader: 'postcss-loader', options: { sourceMap: true } },
        'resolve-url-loader',
      ],
    }),
  },
  {
    test: /\.scss$/,
    include: [
      src,
      path.resolve(process.cwd(), 'node_modules')
    ],
    use: ExtractTextPlugin.extract({
      fallback: 'style-loader',
      use: [
        { loader: 'css-loader', query: { sourceMap: true } },
        { loader: 'postcss-loader', options: { sourceMap: true } },
        'resolve-url-loader',
        {
          loader: 'sass-loader', query: { sourceMap: isProduction ? 'compressed' : 'expanded' }
        }
      ]
    })
  }
];

module.exports = {
  context: src,
  devtool: isProduction ? 'source-map' : 'cheap-module-eval-source-map',
  cache:   !isProduction,
  bail:    isProduction,
  target:  'web',
  resolve: {
    modules: [
      'src',
      'node_modules',
    ],
    extensions: ['.js', '.jsx', '.json', '.css', '.scss', '.html']
  },
  entry: helpers.sanitizeObject({
    'vendors': isProduction ? ['babel-polyfill', './js/vendors.js'] : [],
    'aframe-project': (isHot ? [
      '../devel/utils/webpack-runtime.js',
      'webpack-hot-middleware/client?path=/webpack-hot-module-replace&timeout=20000&reload=true',
    ] : [] ).concat([
      './js/index.js',
      './sass/main.scss',
    ]),
  }),

  output: {
    filename: path.join('js', (isProduction ? '[name].[chunkhash].js' : '[name].js')),
    chunkFilename: isProduction ? '[name].[chunkhash].chunk.js' : '[name].chunk.js',
    path: build,
    publicPath: publicPath,
    pathinfo: !isProduction,
  },
  performance: {
    hints: isProduction ? 'warning' : false,
  },

  module: {
    rules: [
      {
        test: /\.js[x]?$/,
        enforce: 'pre',
        use: {
          loader: 'eslint-loader',
          options: {
            configFile: './.eslintrc.json',
          },
        },
        include: [src],
        exclude: [/node_modules/],
      },{
        test: /\.js[x]?$/,
        include: [src],
        exclude: [/node_modules/],
        use: {
          loader: 'babel-loader',
        },
      },{
        test: /\.html$/,
        use: {
          loader: 'html-loader',
        },
      },{
        test: /\.hbs/,
        use: {
          loader: `handlebars-loader?helperDirs[]=${__dirname}/src/scene/helpers`,
        },
      },{
        test: /\.json$/,
        use: {
          loader: 'json-loader',
        },
      },{
        test: /\.(jpg|jpeg)$/,
        use: 'url-loader?name=[name].[ext]&limit=8192&mimetype=image/jpg'
      },{
        test: /\.gif$/,
        use: 'url-loader?name=[name].[ext]&limit=8192&mimetype=image/gif'
      },{
        test: /\.png$/,
        use: 'url-loader?name=[name].[ext]&limit=8192&mimetype=image/png'
      },{
        test: /\.svg$/,
        use: 'url-loader?name=[name].[ext]&limit=8192&mimetype=image/svg+xml'
      },{
        test: /\.woff?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: { loader: 'url-loader', options: { limit: 100000 } },
      },{
        test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: { loader: 'url-loader', options: { limit: 100000 } },
      },{
        test: /\.(ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: ['file-loader?name=[name].[ext]&limit=100000&mimetype=application/octet-stream']
      },{
        test: /\.otf(\?.*)?$/,
        use: 'file-loader?name=[name].[ext]&limit=10000&mimetype=font/opentype'
      },
    ].concat(cssRules)
  },
  plugins: [
    new Webpack.DefinePlugin({
      'process.env.NODE_ENV': isProduction ? JSON.stringify('production') : JSON.stringify('development'),
      __DEV__: !isProduction,
    }),

    new Webpack.ProvidePlugin({
      'fetch': 'imports-loader?this=>global!exports-loader?global.fetch!whatwg-fetch',
    }),

    new Webpack.LoaderOptionsPlugin({
      minimize: isProduction,
      debug: !isProduction,
      stats: {
        colors: true
      },
      options: {
        context: src,
        output: {
          path: build,
        },
        postcss: [
          precss,
          autoprefixer({
            browsers: [
              'last 2 versions',
              'ie >= 11',
            ],
          }),
        ],
      },
      eslint: {
        failOnWarning: false,
        failOnError: true
      },
    }),

    new Webpack.NoEmitOnErrorsPlugin(),

    new ExtractTextPlugin({
      filename: path.join('css', (isProduction ? '[name].[chunkhash].css' : '[name].css')),
      disable: false,
      allChunks: true
    }),

    new StyleLintPlugin({
      configFile: './.stylelintrc.json',
      context: 'src/sass',
      files: '**/*.scss',
      syntax: 'scss',
      failOnError: false
    }),

    new CopyWebpackPlugin([
      { from: 'assets', to: 'assets' }
    ]),

    new Webpack.NamedModulesPlugin(),

  ].concat(devPlugins()).concat(hotPlugins).concat(prodPlugins),
};
