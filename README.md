# @wessberg/rollup-plugin-ts

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
			noEmit: false, // default: false,
			include: [], // The file paths to include,
			exclude: [] // The file paths to exclude
		})
	]
}
```