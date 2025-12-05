const path = require('path');

module.exports = function () {
  return {
    name: 'webpack-alias-plugin',
    configureWebpack() {
      return {
        resolve: {
          alias: {
            // Allow access of code inside main app
            '@img2num': path.resolve(__dirname, '..', 'src'),
          },
        },
        module: {
          rules: [
            {
              // Ensure babel-loader transpiles JS/JSX inside src
              test: /\.m?jsx?$/,
              include: [path.resolve(__dirname, '..', 'src')],
              use: {
                loader: require.resolve('babel-loader'),
                options: {
                  // Docusaurus' Babel default config
                  presets: [],
                },
              },
            },
          ],
        },
      };
    },
  };
};
