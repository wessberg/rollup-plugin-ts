import {test} from "./util/test-runner.js";
import {formatCode} from "./util/format-code.js";
import {generateRollupBundle} from "./setup/setup-rollup.js";

test.serial("Merges identical namespaces correctly. #1", {ts: ">=3.8"}, async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
				export * from "./foo";
				export * from "./bar";`
			},
			{
				entry: false,
				fileName: "foo.ts",
				text: `\
				import type * as types from "./types";
				export type Foo = types.Foo;`
			},
			{
				entry: false,
				fileName: "bar.ts",
				text: `\
				import type * as types from "./types";
				export type Bar = types.Bar;`
			},
			{
				entry: false,
				fileName: "types.ts",
				text: `\
				export type Foo = string;
				export type Bar = number;`
			}
		],
		{
			typescript,
			rollup,
			debug: false
		}
	);

	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		declare namespace types {
			type Foo = string;
			type Bar = number;
		}
		type Foo = types.Foo;
		type Bar = types.Bar;
		export { Foo, Bar };`)
	);
});

test.serial("Merges identical namespaces correctly. #2", {ts: ">=3.8"}, async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
				export * from "./foo";
				export * from "./bar";
				export * from "./something";`
			},
			{
				entry: false,
				fileName: "foo.ts",
				text: `\
				import type * as types from "./types";
				export type Foo = types.Foo;`
			},
			{
				entry: false,
				fileName: "bar.ts",
				text: `\
				import type * as types from "./types";
				export type Bar = types.Bar;`
			},
			{
				entry: false,
				fileName: "something.ts",
				text: `\
				import type * as helpers from "./helpers";
				export type Something = helpers.MyHelperType;`
			},
			{
				entry: false,
				fileName: "types.ts",
				text: `\
				import type * as helpers from "./helpers";
				export type Foo = string;
				export type Bar = number;
				export type Baz = helpers.MyHelperType;`
			},
			{
				entry: false,
				fileName: "helpers.ts",
				text: `\
				export type MyHelperType = boolean;`
			}
		],
		{
			typescript,
			rollup,
			debug: false
		}
	);

	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		declare namespace helpers {
			type MyHelperType = boolean;
		}
		declare namespace types {
			type Foo = string;
			type Bar = number;
			type Baz = helpers.MyHelperType;
		}
		type Foo = types.Foo;
		type Bar = types.Bar;
		type Something = helpers.MyHelperType;
		export { Foo, Bar, Something };`)
	);
});

test.serial("Merges identical namespaces correctly. #3", {ts: ">=3.8"}, async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
				export * from "./foo";
				export * from "./bar";`
			},
			{
				entry: false,
				fileName: "foo.ts",
				text: `\
				import type * as types from "./types";
				export type Foo = types.Foo;`
			},
			{
				entry: false,
				fileName: "bar.ts",
				text: `\
				import type * as typesWithAnotherName from "./types";
				export type Bar = typesWithAnotherName.Bar;`
			},
			{
				entry: false,
				fileName: "types.ts",
				text: `\
				export type Foo = string;
				export type Bar = number;`
			}
		],
		{
			typescript,
			rollup,
			debug: false
		}
	);

	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		declare namespace types {
			type Foo = string;
			type Bar = number;
		}
		type Foo = types.Foo;
		import typesWithAnotherName = types;
		type Bar = typesWithAnotherName.Bar;
		export { Foo, Bar };`)
	);
});

test.serial("Merges identical namespaces correctly. #4", {ts: ">=3.8"}, async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
				export * from "./foo";
				export * as TypesNS from "./types";`
			},
			{
				entry: false,
				fileName: "foo.ts",
				text: `\
				import type * as types from "./types";
				export type Foo = types.Foo;`
			},
			{
				entry: false,
				fileName: "types.ts",
				text: `\
				export type Foo = string;
				export type Bar = number;`
			}
		],
		{
			typescript,
			rollup,
			debug: false
		}
	);

	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		declare namespace types {
			type Foo = string;
			type Bar = number;
		}
		type Foo = types.Foo;
		export { Foo, types as TypesNS };`)
	);
});
