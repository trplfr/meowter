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
        test: /\.(woff|woff2|ttf|png|jpg)$/,
        use: {
          loader: 'url-loader'
        }
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'babel-loader'
          },
          {
            loader: 'react-svg-loader',
            options: {
              jsx: true
            }
          }
        ]
      }
    ]
  },
  resolve: {
    alias: {
      assets: path.resolve(__dirname, '../', 'src/assets'),
      common: path.resolve(__dirname, '../', 'src/common'),
      core: path.resolve(__dirname, '../', 'src/core'),
      screens: path.resolve(__dirname, '../', 'src/screens'),
      store: path.resolve(__dirname, '../', 'src/store')
    },
    extensions: ['*', '.js', '.jsx']
  },
  output: {
    path: path.resolve(__dirname, '../', 'dist'),
    publicPath: '/',
    filename: 'bundle.js'
  }
}
