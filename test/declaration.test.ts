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
		interface Foo extends Bar {}
		export {Foo};
		`)
	);
});

test("Flattens declarations. #2", async t => {
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

test("Flattens declarations. #3", async t => {
	const bundle = await generateRollupBundle(
		[
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
		],
		{debug: false}
	);
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

test("Flattens declarations. #4", async t => {
	const bundle = await generateRollupBundle(
		[
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
		],
		{debug: false}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		type Something = "foo" | "bar";
		declare const enum SomethingElse {
			FOO = 0,
			BAR = 1
		}
		export {Something, SomethingElse};
		`)
	);
});

test("Flattens declarations. #5", async t => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					import * as m from "./bar";
					export { m };
					`
			},
			{
				entry: false,
				fileName: "bar.ts",
				text: `\
					export const ten = 10;
					`
			}
		],
		{debug: false}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		declare namespace m {
    	const ten = 10;
		}
		export { m };
		`)
	);
});

test("Flattens declarations. #6", async t => {
	const bundle = await generateRollupBundle([
		{
			entry: true,
			fileName: "index.ts",
			text: `\
          		export * from "./foo";
        	`
		},
		{
			entry: false,
			fileName: "foo/index.ts",
			text: `\
				export const Foo = "foo";
				`
		}
	]);
	const {
		declarations: [file]
	} = bundle;
	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			declare const Foo = "foo";
			export {Foo};
		`)
	);
});

test("Flattens declarations. #7", async t => {
	const bundle = await generateRollupBundle([
		{
			entry: true,
			fileName: "index.ts",
			text: `\
          		export * from "./foo.baz";
          		export * from "./bar.baz";
        	`
		},
		{
			entry: false,
			fileName: "foo.baz.ts",
			text: `\
				export const Foo = "foo";
				`
		},
		{
			entry: false,
			fileName: "bar.baz.ts",
			text: `\
				export const Bar = "bar";
				`
		}
	]);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			declare const Foo = "foo";
			declare const Bar = "bar";
			export {Foo, Bar};
		`)
	);
});

test("Flattens declarations. #8", async t => {
	const bundle = await generateRollupBundle([
		{
			entry: true,
			fileName: "index.ts",
			text: `\
							import {Foo} from "./foo";
          		export const foo: Foo = 2;
        	`
		},
		{
			entry: false,
			fileName: "foo.ts",
			text: `\
				export type Foo = number;
				`
		}
	]);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			type Foo = number;
			declare const foo: Foo;
			export {foo};
		`)
	);
});

test("Flattens declarations. #9", async t => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
        import * as bar from './bar';
        export type FooType = bar.BarType;
			`
			},
			{
				entry: false,
				fileName: "bar.ts",
				text: `\
        export type BarType = 'a' | 'b' | 'c';
			`
			}
		],
		{debug: false}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			declare namespace bar {
					type BarType = 'a' | 'b' | 'c';
			}
			type FooType = bar.BarType;
			export { FooType };
		`)
	);
});

test("Flattens declarations. #10", async t => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
        import { Item } from './items';
				export class B {
					items: Item[];
				}
			`
			},
			{
				entry: false,
				fileName: "items/item.ts",
				text: `\
        export interface Item {
					id: string;
				}
			`
			},
			{
				entry: false,
				fileName: "items/index.ts",
				text: `\
        export * from "./item";
			`
			}
		],
		{debug: false}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			interface Item {
					id: string;
			}
			declare class B {
					items: Item[];
			}
			export { B };
		`)
	);
});

test("Flattens declarations. #11", async t => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
        import {X} from "./x"
				export const y = new X
			`
			},
			{
				entry: false,
				fileName: "x.ts",
				text: `\
        declare class X {}
				export {X}
			`
			}
		],
		{
			debug: false,
			rollupOptions: {
				external(id) {
					return /\bx\b/.test(id);
				}
			}
		}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		declare class X {
		}
		declare const y: X;
		export { y };

		`)
	);
});

test("Flattens declarations. #12", async t => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
        export {Foo} from "./foo"
			`
			},
			{
				entry: false,
				fileName: "foo.ts",
				text: `\
        export class Foo { static m() { return 1 } }
			`
			}
		],
		{
			debug: false
		}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			declare class Foo {
				static m(): number;
			}
			export {Foo};
		`)
	);
});
