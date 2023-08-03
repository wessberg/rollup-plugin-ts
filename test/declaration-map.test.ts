import {test} from "./util/test-runner.js";
import {formatCode} from "./util/format-code.js";
import {generateRollupBundle} from "./setup/setup-rollup.js";
import {createExternalTestFiles} from "./setup/test-file.js";

test.serial("Declaration maps correctly maps input sources. #1", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "src/main.ts",
				text: `\
					import {Foo, Bar} from "./foo";
					export {Foo};
					export {Bar};
					`
			},
			{
				entry: false,
				fileName: "src/foo.ts",
				text: `\
					export const Foo = "Hello, World!";
					export const Bar = 2;
					`
			}
		],
		{
			typescript,
			rollup,
			dist: "dist",
			debug: false,
			tsconfig: {declarationMap: true}
		}
	);
	const {
		declarationMaps: [map],
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(
			`\
		declare const Foo = "Hello, World!";
		declare const Bar = 2;
		export { Foo, Bar };
		//# sourceMappingURL=main.d.ts.map
		`
		)
	);

	t.deepEqual(
		formatCode(map.code, "json"),
		formatCode(
			`\
		{"version":3,"file":"main.d.ts","sourceRoot":"","sources":["../src/main.ts", "../src/foo.ts"],"names":[],"mappings":";;AACK,OAAO,YAAK,CAAC"}
		`,
			"json"
		)
	);
});

test.serial("Declaration maps correctly maps input sources. #2", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					import {Foo} from "./foo";
					export {Foo}
					`
			},
			{
				entry: false,
				fileName: "foo.ts",
				text: `\
					export type Foo = string;
					`
			}
		],
		{
			typescript,
			rollup,
			debug: false,
			tsconfig: {declarationMap: true, declarationDir: "./foobarbaz"}
		}
	);
	const {
		declarationMaps: [file]
	} = bundle;
	t.deepEqual(
		formatCode(file.code, "json"),
		formatCode(
			`\
		{"version":3,"file":"index.d.ts","sourceRoot":"","sources":["../index.ts","../foo.ts"],"names":[],"mappings":";AACK,OAAO,OAAK,CAAA"}
		`,
			"json"
		)
	);
});

test.serial("Declaration maps respect rewritten output paths. #1", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					import {Foo} from "./foo";
					export {Foo}
					`
			},
			{
				entry: false,
				fileName: "foo.ts",
				text: `\
					export type Foo = string;
					`
			}
		],
		{
			typescript,
			rollup,
			debug: false,
			tsconfig: {
				declarationMap: true,
				declarationDir: "./foobarbaz"
			},
			hook: {
				outputPath: path => path.replace("index.d.ts", "index-rewritten.d.ts")
			}
		}
	);
	const {
		declarationMaps: [file]
	} = bundle;
	t.deepEqual(
		formatCode(file.code, "json"),
		formatCode(
			`\
		{"version":3,"file":"index-rewritten.d.ts","sourceRoot":"","sources":["../index.ts","../foo.ts"],"names":[],"mappings": ";AACK,OAAO,OAAK,CAAA"}
		`,
			"json"
		)
	);
});

test.serial("Declaration maps respect rewritten output paths. #2", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			...createExternalTestFiles("my-library", `export type Bar = string;`),
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					export * from "./foo";
					`
			},
			{
				entry: false,
				fileName: "foo.ts",
				text: `\
					export * from "./bar";
					`
			},
			{
				entry: false,
				fileName: "bar.ts",
				text: `\
					export * from "./bar";
					export {Bar as Foo} from "my-library";
					`
			}
		],
		{
			typescript,
			rollup,
			debug: false,
			tsconfig: {
				declarationMap: true
			},
			hook: {
				outputPath: (path, kind) => {
					if (kind === "declaration") return path.replace("index.d.ts", "nested/dir/index-rewritten.d.ts");
					return path.replace("index.d.ts", "index-rewritten.d.ts");
				}
			}
		}
	);
	const {
		declarations: [file],
		declarationMaps: [mapFile]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		export { Bar as Foo } from "my-library";
		//# sourceMappingURL=index-rewritten.d.ts.map
		`)
	);

	t.deepEqual(
		formatCode(mapFile.code, "json"),
		formatCode(
			`\
		{"version":3,"file":"index-rewritten.d.ts","sourceRoot":"","sources":["../../index.ts","../../bar.ts","../../foo.ts"],"names":[],"mappings": ""}
		`,
			"json"
		)
	);
});
