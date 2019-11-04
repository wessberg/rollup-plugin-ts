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
		interface Foo extends Bar {}
		export {Foo};
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
		interface Foo_$0 extends Bar {
		}
		export {Foo_$0 as Foo};
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

test("Flattens declarations. #7", async t => {
	const bundle = await generateRollupBundle([
		{
			entry: true,
			fileName: "index.ts",
			text: `\
					import * as m from './bar';
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
	]);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		type m = {
			ten: typeof ten;
		};
		declare const ten = 10;
		export { m };
		`)
	);
});

test("Flattens declarations. #8", async t => {
	const bundle = await generateRollupBundle([
		{
			entry: true,
			fileName: "index.ts",
			text: `\
          import {BuiltInParser} from './bar';
					import {Bar} from "./bar";
          export interface Foo extends Bar {
            x: BuiltInParser;
          }
					`
		},
		{
			entry: false,
			fileName: "bar.ts",
			text: `\
          export {BuiltInParser} from 'prettier';
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
		import { BuiltInParser } from "prettier";
		interface Bar {
  		a: string;
  	}
  	interface Foo extends Bar {
  		x: BuiltInParser;
  	}
  	export {Foo};
		`)
	);
});

test("Flattens declarations. #9", async t => {
	const bundle = await generateRollupBundle([
		{
			entry: true,
			fileName: "index.ts",
			text: `\
          import magicString from './bar';
					export const Foo = magicString;
					`
		},
		{
			entry: false,
			fileName: "bar.ts",
			text: `\
          export {default} from 'magic-string';
					`
		}
	]);
	const {
		declarations: [file]
	} = bundle;
	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		import magicString from "magic-string";
		declare const Foo: typeof magicString;
		export {Foo};
		`)
	);
});

test("Flattens declarations. #10", async t => {
	const bundle = await generateRollupBundle([
		{
			entry: true,
			fileName: "index.ts",
			text: `\
          import magicString from './bar';
					export const Foo = magicString;
					`
		},
		{
			entry: false,
			fileName: "bar.ts",
			text: `\
          export {default as default} from 'magic-string';
					`
		}
	]);
	const {
		declarations: [file]
	} = bundle;
	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		import magicString from "magic-string";
		declare const Foo: typeof magicString;
		export {Foo};
		`)
	);
});

test("Flattens declarations. #11", async t => {
	const bundle = await generateRollupBundle([
		{
			entry: true,
			fileName: "index.ts",
			text: `\
          import {Bar} from './bar';
					export const Foo = Bar;
					`
		},
		{
			entry: false,
			fileName: "bar.ts",
			text: `\
          export {default as Bar} from 'magic-string';
					`
		}
	]);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		import { default as Bar } from "magic-string";
		declare const Foo: typeof Bar;
		export {Foo};
		`)
	);
});

test.only("Flattens declarations. #12", async t => {
	const bundle = await generateRollupBundle([
		{
			entry: true,
			fileName: "index.ts",
			text: `\
          		import X from './bar';
          		export { X }
        	`
		},
		{
			entry: false,
			fileName: "bar.ts",
			text: `\
				interface Foo { n: number; }
				export const fn = (x: Foo): Foo => x;
				export default fn({ n: 0 });
            `
		}
	], {debug: true});
	const {
		declarations: [file]
	} = bundle;
	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		interface Foo {
    	n: number;
		}
		declare const defaultBarExport: Foo;
		declare const X: typeof defaultBarExport;
		export { X };
		`)
	);
});

test.skip("Flattens declarations. #13", async t => {
	const bundle = await generateRollupBundle([
		{
			entry: true,
			fileName: "index.ts",
			text: `\
          		import X from './bar';
          		export { X }
        	`
		},
		{
			entry: false,
			fileName: "bar.ts",
			text: `\
				export default function foo (): string {return "";} `
		}
	]);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		declare function foo(): string;
		declare const X: typeof foo;
		export { X };
		`)
	);
});

test.skip("Flattens declarations. #14", async t => {
	const bundle = await generateRollupBundle([
		{
			entry: true,
			fileName: "index.ts",
			text: `\
          		import X from './bar';
          		export { X }
        	`
		},
		{
			entry: false,
			fileName: "bar.ts",
			text: `\
				enum FooKind {A, B}
				export default FooKind;
				`
		}
	]);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		declare enum FooKind {
			A = 0,
			B = 1
		}
		declare type X = FooKind;
		export { X };
		`)
	);
});