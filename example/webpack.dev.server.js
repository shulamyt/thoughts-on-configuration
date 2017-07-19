var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config.js');
var port = 8080;

new WebpackDevServer(webpack(config), {
		host: 'localhost',
		https: false,
		stats: 'verbose',
		compress: true,
		clientLogLevel: 'none',
		contentBase: process.cwd(),
		watchContentBase: true,
		hot: true,
		publicPath: '/',
		quiet: true,
		inline: true,
		overlay: false,
		watchOptions: {
		aggregateTimeout: 100,
		ignored: /node_modules/
		}
	}).listen(port, 'localhost', function (err, result) {
	if (err) {
		console.log(err);
	}
	console.log('Dev server listening at localhost: ' + port);
});