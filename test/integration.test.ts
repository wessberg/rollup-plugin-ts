import test from "ava";
import {generateRollupBundle} from "./setup/setup-rollup";
import alias from "@rollup/plugin-alias";
import {formatCode} from "./util/format-code";

// tslint:disable:no-duplicate-string

test("Integrates with @rollup/plugin-alias without problems. #1", async t => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "virtual-src/index.ts",
				text: `\
					import { Foo } from '@src/foo';
					export const singleton = new Foo();
					`
			},
			{
				entry: false,
				fileName: "virtual-src/foo.ts",
				text: `\
					export class Foo {
						public bar(): void {
							console.log('bar');
						}
					}
					`
			},
			{
				entry: false,
				fileName: "tsconfig.json",
				text: `\
					{
						"extends": "../tsconfig.base.json",
						"compilerOptions": {
							"outDir": "./virtual-dist",
							"rootDirs": [ "./virtual-src" ],
							"baseUrl": ".",
							"paths": {
								"@src/*": [ "./virtual-src/*" ]
							}
						},
						"include": [
							"./virtual-src/**/*"
						],
						"exclude": [
							"./node_modules",
							"./virtual-dist"
						]
					}
				`
			},
			{
				entry: false,
				fileName: "../tsconfig.base.json",
				text: `\
					{
						"exclude": [ "node_modules" ],
						"compilerOptions": {
							"target": "es2018",
							"module": "esnext",
							"moduleResolution": "node",
							"allowSyntheticDefaultImports": true,
							"esModuleInterop": true,
							"declaration": true,
							"declarationMap": true,
							"experimentalDecorators": true,
							"inlineSources": false,
							"inlineSourceMap": false,
							"listEmittedFiles": true,
							"noEmitOnError": true,
							"noFallthroughCasesInSwitch": true,
							"noImplicitAny": true,
							"noImplicitReturns": true,
							"noUnusedLocals": true,
							"noUnusedParameters": true,
							"removeComments": true,
							"sourceMap": true,
							"strict": true
						}
					}
				`
			}
		],
		{
			debug: false,
			tsconfig: "tsconfig.json",
			prePlugins: [
				alias({
					resolve: [".js", ".ts", ""],
					entries: [{find: "@src", replacement: "virtual-src"}]
				})
			]
		}
	);
	const {
		js: [file]
	} = bundle;
	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		class Foo {
				bar() {
						console.log('bar');
				}
		}
		
		const singleton = new Foo();
		
		export { singleton };
		`)
	);
});
