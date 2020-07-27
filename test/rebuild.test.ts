import test from "./util/test-runner";
import {formatCode} from "./util/format-code";
import {generateRollupBundle} from "./setup/setup-rollup";
import {lt} from "semver";

test("Won't produce empty declarations when output directory is not excluded from TypeScript. #1", async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "virtual-src/index.ts",
				text: `\
        export interface Foo {
        	foo: string;
        }
			`
			},
			{
				entry: false,
				fileName: "virtual-dist/index.js",
				text: `\
        console.log(true);
			`
			},
			{
				entry: false,
				fileName: "virtual-dist/index.d.ts",
				text: `\
        interface Foo {
          foo: string;
        }
        export {Foo};
			`
			}
		],
		{
			typescript,
			debug: false,
			dir: "virtual-dist"
		}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			interface Foo {
         foo: string;
      }
      export {Foo};
		`)
	);
});

test("Won't produce empty declarations when baseUrl is outside of compilation root. #1", async (t, {typescript}) => {
	if (lt(typescript.version, "3.4.0")) {
		t.pass(`Current TypeScript version (${typescript.version} does not support the 'incremental' option Skipping...`);
		return;
	}
	const bundle = await generateRollupBundle(
		[
			{
				entry: false,
				fileName: "../../../tsconfig.json",
				text: `\
					{
						"compilerOptions": {
							"baseUrl": "./",
							"rootDir": ".",
							"incremental": true,
							"composite": true,
							"declaration": true,
							"declarationMap": true,
							"paths": {
								"@foo/*": ["./packages/@foo/*/source"]
							},
						},
						"references": [
							{ "path": "./packages/@foo/a" },
							{ "path": "./packages/@foo/b" }
						]
					}
				`
			},
			{
				entry: false,
				fileName: "tsconfig.json",
				text: `\
					{
						"extends": "../../../tsconfig.json",
						"compilerOptions": {
							"outDir": "./out"
						},
						"references": [{ "path": "../b" }]
					}
				`
			},
			{
				entry: false,
				fileName: "../b/tsconfig.json",
				text: `\
					{
						"extends": "../../../tsconfig.json",
						"compilerOptions": {
							"outDir": "./out"
						},
						"references": [{ "path": "../a" }]
					}
				`
			},
			{
				entry: false,
				fileName: "../b/source/index.ts",
				text: `\
					export interface Person {
						name: string
					};
				`
			},
			{
				entry: true,
				fileName: "source/index.ts",
				text: `\
					import {Person} from "@foo/b";
					export interface Man extends Person {
					}
				`
			}
		],
		{
			typescript,
			debug: false,
			dir: "out",
			cwd: "subproject/packages/@foo/a",
			tsconfig: "tsconfig.json"
		}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			interface Person {
				name: string;
			}
			interface Man extends Person {}
			export { Man };
			//# sourceMappingURL=index.d.ts.map
		`)
	);
});
