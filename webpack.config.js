const path = require('path');

module.exports = {
  entry: './src/gamewatcher.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'production',
  target: 'web',
  externals: {
    browser: 'browser', 
  }
};
