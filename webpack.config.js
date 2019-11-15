const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const mode = process.env.NODE_ENV || 'development';
const prod = mode === 'production';

module.exports = {
	entry: {
		bundle: ['./src/main.js']
	},
	resolve: {
		extensions: ['.mjs', '.js']
	},
	output: {
		path: __dirname + '/docs',
		filename: '[name].js',
		chunkFilename: '[name].[id].js'
	},
	module: {
		rules: [
			{
				test: /\.(png|svg|jpe?g|gif)$/,
				use: {
					loader: 'file-loader',
					options: {
						outputPath: 'images',
					}
				}
			},
			{
				test: /\.(sa|sc|c)ss$/,
				use: [
					/**
					 * MiniCssExtractPlugin doesn't support HMR.
					 * For developing, use 'style-loader' instead.
					 * */
					prod ? MiniCssExtractPlugin.loader : 'style-loader',
					'css-loader',
					'sass-loader',
				]
			}
		]
	},
	mode,
	plugins: [
		new MiniCssExtractPlugin({
			filename: '[name].css'
		})
	],
	devtool: prod ? false: 'source-map',
	devServer: {
		contentBase: 'docs',
		hot: false,
		inline: false,
		host: '0.0.0.0',
		disableHostCheck: true
	}
};
