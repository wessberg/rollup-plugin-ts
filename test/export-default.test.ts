import test from "ava";
import {formatCode} from "./util/format-code";
import {generateRollupBundle} from "./setup/setup-rollup";
// tslint:disable:no-duplicate-string

test("Handles default export assignments. #1", async t => {
	const bundle = await generateRollupBundle(
		[
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
		],
		{debug: false}
	);
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

test("Handles default export assignments. #2", async t => {
	const bundle = await generateRollupBundle(
		[
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
		],
		{debug: false}
	);
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

test("Handles default export assignments. #3", async t => {
	const bundle = await generateRollupBundle(
		[
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
		],
		{debug: false}
	);
	const {
		declarations: [file]
	} = bundle;
	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		interface Foo {
				n: number;
		}
		declare const _default: Foo;
		declare const X: typeof _default;
		export { X };
		`)
	);
});

test("Handles default export assignments. #4", async t => {
	const bundle = await generateRollupBundle(
		[
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
		],
		{debug: false}
	);
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

test("Handles default export assignments. #5", async t => {
	const bundle = await generateRollupBundle(
		[
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
		],
		{debug: false}
	);
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
		declare const X: typeof FooKind;
		export { X };
		`)
	);
});

test("Handles default export assignments. #6", async t => {
	const bundle = await generateRollupBundle(
		[
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
				interface FooKind {}
				export default FooKind;
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
		interface FooKind {
		}
		type X = FooKind;
		export { X };
		`)
	);
});

test("Handles default export assignments. #7", async t => {
	const bundle = await generateRollupBundle([
		{
			entry: true,
			fileName: "index.ts",
			text: `\
							export {default} from "./foo";
        	`
		},
		{
			entry: false,
			fileName: "foo.ts",
			text: `\
				export default function foo () {}
				`
		}
	]);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			declare function foo (): void;
			export {foo as default};
		`)
	);
});

test("Handles default export assignments. #8", async t => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
						export default class DefaultClass {
							private static readonly constant = 0;
						
							public static staticMethod(): void {
								console.log(DefaultClass.constant)
							}
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
			declare class DefaultClass {
				private static readonly constant;
				static staticMethod(): void;
			}
				export { DefaultClass as default };
		`)
	);
});

test("Handles default exports inside ExportSpecifiers. #1", async t => {
	const bundle = await generateRollupBundle(
		[
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
		],
		{debug: true}
	);
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

test("Handles default exports inside ExportSpecifiers. #2", async t => {
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

test("Handles default exports inside ExportSpecifiers. #3", async t => {
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
