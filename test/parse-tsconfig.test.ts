import test from "ava";
import {generateRollupBundle} from "./setup/setup-rollup";
import {formatCode} from "./util/format-code";

test("Correctly parse TypeScript config files within sub-directories. #1", async t => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "virtual-src/index.ts",
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
							"rootDir": "../virtual-src",
							"outDir": "../virtual-dist",
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
							"../virtual-src/**/*.ts"
						],
						"exclude": [
							"../node_modules",
							"../virtual-dist"
						]
					}
				`
			}
		],
		{
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
