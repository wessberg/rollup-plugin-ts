/* eslint-disable @typescript-eslint/no-require-imports */
// @ts-check

/**
 * @type {import("helpertypes").PartialDeep<import("sandhog").SandhogConfig>}
 */
const config = {
	...require("@wessberg/ts-config/sandhog.config.json"),
	isDevelopmentPackage: true,
	logo: {
		url: "https://raw.githubusercontent.com/wessberg/rollup-plugin-ts/master/documentation/asset/rollup-plugin-ts-logo.png",
		height: 150
	}
};
module.exports = config;
