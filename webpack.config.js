/* globals module, __dirname */

const target = '/lib/';

function createConfig({name, filename = name, source, path = ''}) {
  return {
    entry: `./src/${source}`,
    output: {
      path: __dirname + target + path,
      filename: `${filename}.js`,
      library: name,
      libraryTarget: 'umd',
      umdNamedDefine: true,
    },
    resolve: {
      modules: [
        'node_modules',
        'src/',
      ],
    },
    module: {
      loaders: [
        {
          test: /(\.jsx|\.js)$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          options: {
            presets: ['shopify/web'],
          },
        },
      ],
    },
  };
}

module.exports = [
  createConfig({name: 'ShipitGS', filename: 'shipit-gs.bundle', source: 'index'}),
  createConfig({name: 'ShipitGS', filename: 'shipit-gs.bundle.legacy', source: 'index.legacy'}),
  createConfig({name: 'ShipitGS', filename: 'shipit-gs', source: 'index'}),

//  createConfig({name: 'utils', filename: 'utils', source: 'shared/utils/index'}),
];

