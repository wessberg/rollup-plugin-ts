import baseConfig from "@wessberg/ts-config/sandhog.config.js";

export default {
	...baseConfig,
	isDevelopmentPackage: true,
	logo: {
		url: "https://raw.githubusercontent.com/wessberg/rollup-plugin-ts/master/documentation/asset/rollup-plugin-ts-logo.png",
		height: 150
	}
};
