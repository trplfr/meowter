const path = require('path')

module.exports = {
  entry: './src/index.js',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader', 'eslint-loader']
      },
      {
        test: /\.(woff|woff2|ttf)$/,
        use: {
          loader: 'url-loader'
        }
      }
    ]
  },
  resolve: {
    alias: {
      assets: path.resolve(__dirname, '../', 'src/assets'),
      common: path.resolve(__dirname, '../', 'src/common'),
      modules: path.resolve(__dirname, '../', 'src/modules'),
      screens: path.resolve(__dirname, '../', 'src/screens')
    },
    extensions: ['*', '.js', '.jsx']
  },
  output: {
    path: path.resolve(__dirname, '../', 'dist'),
    publicPath: '/',
    filename: 'bundle.js'
  }
}
