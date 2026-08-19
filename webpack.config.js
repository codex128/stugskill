const path = require('path');

module.exports = {
  entry: {
    game: './src/gamewatcher.js',
    leaderboard: './src/leaderboard.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'production',
  target: 'web',
  externals: {
    browser: 'browser',
  }
};
