import ts from "@wessberg/rollup-plugin-ts";
import packageJson from "./package.json";

import {builtinModules} from "module";

export default {
	watch: {
		clearScreen: false
	},
	input: "src/index.ts",
	output: [
		{
			file: packageJson.main,
			format: "cjs",
			sourcemap: true,
			exports: "default"
		},
		{
			file: packageJson.module,
			format: "esm",
			sourcemap: true
		}
	],
	plugins: [
		ts({
			tsconfig: "tsconfig.build.json"
		})
	],
	external: [...builtinModules, ...Object.keys(packageJson.dependencies), ...Object.keys(packageJson.devDependencies), ...Object.keys(packageJson.peerDependencies)]
};
