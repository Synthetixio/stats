// next.config.js
const path = require('path');

module.exports = {
	webpack(config) {
		config.module.rules.push({
			test: /\.(svg)$/,
			include: path.resolve(__dirname, 'assets/svg'),
			loader: 'svg-react-loader',
		});

		return config;
	},
	env: {},
	images: {
		domains: ['raw.githubusercontent.com']
	}
};
