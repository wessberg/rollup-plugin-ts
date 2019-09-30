import test from "ava";
import {formatCode} from "./util/format-code";
import {generateRollupBundle} from "./setup/setup-rollup";

// tslint:disable:no-duplicate-string

test("Flattens declarations. #1", async t => {
	const bundle = await generateRollupBundle([
		{
			entry: true,
			fileName: "index.ts",
			text: `\
					import {Bar} from "./bar";
					export interface Foo extends Bar {}
					`
		},
		{
			entry: false,
			fileName: "bar.ts",
			text: `\
					export interface Bar {
						a: string;
					}
					`
		}
	]);
	const {
		declarations: [file]
	} = bundle;
	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		interface Bar {
			a: string;
		}
		export interface Foo extends Bar {}
		`)
	);
});

test("Flattens declarations. #2", async t => {
	const bundle = await generateRollupBundle([
		{
			entry: true,
			fileName: "index.ts",
			text: `\
					import Bar from "./bar";
					export interface Foo extends Bar {}
					`
		},
		{
			entry: false,
			fileName: "bar.ts",
			text: `\
					export default interface Bar {
						a: string;
					}
					`
		}
	]);
	const {
		declarations: [file]
	} = bundle;
	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		interface Bar {
			a: string;
		}
		export interface Foo extends Bar {}
		`)
	);
});

test("Flattens declarations. #3", async t => {
	const bundle = await generateRollupBundle([
		{
			entry: true,
			fileName: "index.ts",
			text: `\
					import {Bar} from "./bar";
					export interface Foo extends Bar {}
					`
		},
		{
			entry: false,
			fileName: "bar.ts",
			text: `\
					interface Foo {
						a: string;
					}
					export interface Bar extends Foo {
					}
					`
		}
	]);
	const {
		declarations: [file]
	} = bundle;
	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		interface Foo {
			a: string;
		}
		interface Bar extends Foo {
		}
		export interface Foo_$0 extends Bar {
		}
		`)
	);
});

test("Flattens declarations. #4", async t => {
	const bundle = await generateRollupBundle([
		{
			entry: true,
			fileName: "index.ts",
			text: `\
					export * from "./bar";
					`
		},
		{
			entry: false,
			fileName: "bar.ts",
			text: `\
					export interface Foo {}
					`
		}
	]);
	const {
		declarations: [file]
	} = bundle;
	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		interface Foo {}
		export {Foo};
		`)
	);
});

test("Flattens declarations. #5", async t => {
	const bundle = await generateRollupBundle([
		{
			entry: true,
			fileName: "index.ts",
			text: `\
					export * from "./bar";
					`
		},
		{
			entry: false,
			fileName: "bar.ts",
			text: `\
					export * from "./baz";
					`
		},
		{
			entry: false,
			fileName: "baz.ts",
			text: `\
					export interface Foo {}
					`
		}
	]);
	const {
		declarations: [file]
	} = bundle;
	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		interface Foo {}
		export {Foo};
		`)
	);
});

test("Flattens declarations. #6", async t => {
	const bundle = await generateRollupBundle([
		{
			entry: true,
			fileName: "index.ts",
			text: `\
					export * from "./bar";
					`
		},
		{
			entry: false,
			fileName: "bar.ts",
			text: `\
					export * from "./a";
					export * from "./b";
					`
		},
		{
			entry: false,
			fileName: "a.ts",
			text: `\
					export type Something =
					| "foo"
					| "bar";
					`
		},
		{
			entry: false,
			fileName: "b.ts",
			text: `\
					export const enum SomethingElse {
						FOO = 0,
						BAR = 1
					}
					`
		}
	]);
	const {
		declarations: [file]
	} = bundle;
	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		declare type Something =
			| "foo"
			| "bar";
		declare const enum SomethingElse {
			FOO = 0,
			BAR = 1
		}
		export {Something, SomethingElse};
		`)
	);
});

test("A file with no exports generates a .d.ts file with an 'export {}' declaration to mark it as a module. #1", async t => {
	const bundle = await generateRollupBundle([
		{
			entry: true,
			fileName: "index.ts",
			text: `\
					console.log(true);
					`
		}
	]);
	const {
		declarations: [file]
	} = bundle;
	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		export {};
		`)
	);
});

test("Declaration maps correctly maps input sources. #1", async t => {
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
		{tsconfig: {declarationMap: true}}
	);
	const {
		declarationMaps: [file]
	} = bundle;
	t.deepEqual(
		formatCode(file.code, "json"),
		formatCode(
			`\
		{"version":3,"file":"index.d.ts","sourceRoot":"","sources":["foo.ts","index.ts"],"names":[],"mappings":"AAAK,aAAY,GAAG,GAAG,MAAM,CAACAACK,OAAO,EAAC,GAAG,EAAC,CAAA"}
		`,
			"json"
		)
	);
});

test("Declaration maps correctly maps input sources. #2", async t => {
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

		{tsconfig: {declarationMap: true, declarationDir: "./foobarbaz"}}
	);
	const {
		declarationMaps: [file]
	} = bundle;
	t.deepEqual(
		formatCode(file.code, "json"),
		formatCode(
			`\
		{"version":3,"file":"index.d.ts","sourceRoot":"","sources":["../foo.ts","../index.ts"],"names":[],"mappings":"AAAK,aAAY,GAAG,GAAG,MAAM,CAACAACK,OAAO,EAAC,GAAG,EAAC,CAAA"}
		`,
			"json"
		)
	);
});

test("Declaration maps respect rewritten output paths. #1", async t => {
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
		{"version":3,"file":"index-rewritten.d.ts","sourceRoot":"","sources":["../foo.ts","../index.ts"],"names":[],"mappings":"AAAK,aAAY,GAAG,GAAG,MAAM,CAACAACK,OAAO,EAAC,GAAG,EAAC,CAAA"}
		`,
			"json"
		)
	);
});

test("Declarations respect rewritten output paths. #1", async t => {
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
		declarations: [file]
	} = bundle;
	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		declare type Foo = string;
		export {Foo};
		//# sourceMappingURL=index-rewritten.d.ts.map
		`)
	);
});
