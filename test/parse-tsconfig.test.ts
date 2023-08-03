import {test} from "./util/test-runner.js";
import {generateRollupBundle} from "./setup/setup-rollup.js";
import {formatCode} from "./util/format-code.js";

test.serial("Correctly parse TypeScript config files within sub-directories. #1", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "src/index.ts",
				text: `\
					export function noop(): void {}
				`
			},
			{
				entry: false,
				fileName: "virtual-configs/tsconfig.json",
				text: `\
					{
						"compilerOptions": {
							"target": "es2018",
							"module": "esnext",
							"moduleResolution": "node",
							"baseUrl": "../",
							"rootDir": "../src",
							"outDir": "../dist",
							"declaration": true,
							"declarationMap": true,
							"listEmittedFiles": true,
							"noImplicitAny": true,
							"noImplicitReturns": true,
							"noUnusedLocals": true,
							"noUnusedParameters": true,
							"removeComments": true,
							"sourceMap": true,
							"strict": true
						},
						"include": [
							"../src/**/*.ts"
						],
						"exclude": [
							"../node_modules",
							"../dist"
						]
					}
				`
			}
		],
		{
			typescript,
			rollup,
			debug: false,
			tsconfig: "virtual-configs/tsconfig.json"
		}
	);

	const {
		js: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			function noop() {}

			export { noop };
		`)
	);
});

test.serial("Correctly parse TypeScript config files within sub-directories. #2", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "src/index.ts",
				text: `\
					export function noop(): void {}
				`
			},
			{
				entry: false,
				fileName: "virtual-configs/tsconfig.build.json",
				text: `\
					{
						"extends": "./tsconfig.base.json",
						"compilerOptions": {
							"rootDir": "../src",
							"outDir": "../dist"
						},
						"include": [
							"../src/**/*.ts"
						]
					}
				`
			},
			{
				entry: false,
				fileName: "virtual-configs/tsconfig.base.json",
				text: `\
					{
						"compilerOptions": {
							"target": "es2018",
							"module": "esnext",
							"moduleResolution": "node",
							"baseUrl": "../",
							"declaration": true,
							"declarationMap": true,
							"listEmittedFiles": true,
							"noImplicitAny": true,
							"noImplicitReturns": true,
							"noUnusedLocals": true,
							"noUnusedParameters": true,
							"removeComments": true,
							"sourceMap": true,
							"strict": true
						},
						"exclude": [
							"../node_modules",
							"../dist"
						]
					}
				`
			}
		],
		{
			typescript,
			rollup,
			debug: false,
			tsconfig: "virtual-configs/tsconfig.build.json"
		}
	);

	const {
		js: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			function noop() {}

			export { noop };
		`)
	);
});
