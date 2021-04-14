import test from "ava";
import {withTypeScript} from "./util/ts-macro";
import {formatCode} from "./util/format-code";
import {generateRollupBundle} from "./setup/setup-rollup";

test.serial("Handles default export assignments. #1", withTypeScript, async (t, {typescript}) => {
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
		{
			typescript,
			debug: false
		}
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

test.serial("Handles default export assignments. #2", withTypeScript, async (t, {typescript}) => {
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
		{
			typescript,
			debug: false
		}
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

test.serial("Handles default export assignments. #3", withTypeScript, async (t, {typescript}) => {
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
		{
			typescript,
			debug: false
		}
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

test.serial("Handles default export assignments. #4", withTypeScript, async (t, {typescript}) => {
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
		{
			typescript,
			debug: false
		}
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

test.serial("Handles default export assignments. #5", withTypeScript, async (t, {typescript}) => {
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
		{
			typescript,
			debug: false
		}
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

test.serial("Handles default export assignments. #6", withTypeScript, async (t, {typescript}) => {
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
		{
			typescript,
			debug: false
		}
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

test.serial("Handles default export assignments. #7", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
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
		],
		{
			typescript,
			debug: false
		}
	);
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

test.serial("Handles default export assignments. #8", withTypeScript, async (t, {typescript}) => {
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
		{
			typescript,
			debug: false
		}
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

test.serial("Handles default exports inside ExportSpecifiers. #1", withTypeScript, async (t, {typescript}) => {
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
		{
			typescript,
			debug: false
		}
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

test.serial("Handles default exports inside ExportSpecifiers. #2", withTypeScript, async (t, {typescript}) => {
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
          export {default as default} from 'magic-string';
					`
			}
		],
		{
			typescript,
			debug: false
		}
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

test.serial("Handles default exports inside ExportSpecifiers. #3", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
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
		],
		{
			typescript,
			debug: false
		}
	);
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

test.serial("Handles default exports inside ExportSpecifiers. #4", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
          export { default as Foo } from "./foo";
					`
			},
			{
				entry: false,
				fileName: "foo.ts",
				text: `\
          function Foo(a: string, b: string): string {
						return a + b;
					}
					Foo.tags = ['foo', 'bar', 'baz'];
					
					export default Foo;
					`
			}
		],
		{
			typescript,
			debug: false
		}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		declare function Foo(a: string, b: string): string;
		declare namespace Foo {
				var tags: string[];
		}
		export { Foo };
		`)
	);
});
