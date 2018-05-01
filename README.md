# @wessberg/rollup-plugin-ts
[![NPM version][npm-version-image]][npm-version-url]
[![License-mit][license-mit-image]][license-mit-url]

[license-mit-url]: https://opensource.org/licenses/MIT

[license-mit-image]: https://img.shields.io/badge/License-MIT-yellow.svg

[npm-version-url]: https://www.npmjs.com/package/@wessberg/rollup-plugin-ts

[npm-version-image]: https://badge.fury.io/js/%40wessberg%2Frollup-plugin-ts.svg

This is a simple Rollup Plugin that can transform Typescript files.
It can generate declaration files and prints diagnostics.

## Installation

You can install this plugin from NPM:

```text
npm install @wessberg/rollup-plugin-ts
``` 

## Usage

Add the plugin to your Rollup plugins:

```javascript
import typescriptRollupPlugin from "@wessberg/rollup-plugin-ts";

// ...

export default {
    // ...
	plugins: [
		// ...
		typescriptRollupPlugin({
		    // The path to the tsconfig.json file to use
			tsconfig: "path_to_tsconfig.json", // default: "tsconfig.json",
			// The path to the project root
			root: "path_to_root", // default: process.cwd(),
			// If true, no files will be emitted, even though 'declaration' is true in the tsconfig.json file
			include: [], // The file paths to include,
			exclude: [] // The file paths to exclude
		})
	]
}
```