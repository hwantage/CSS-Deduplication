const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode : 'production',
  entry: './entry.js', // 번들링의 시작점
  output: {
    filename: 'bundle.js', // JavaScript 번들 파일
    path: path.resolve(__dirname, 'dist'), // 출력 디렉토리
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'bundle.css', // CSS 번들 파일
    }),
  ],
};