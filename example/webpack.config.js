var path = require('path');
var webpack = require('webpack');

module.exports = {
	entry: './src/index.js',
	output: {
	filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist')
	},
	externals: {
		projectListConfig: 'coreProjectListConfig'
	}
};