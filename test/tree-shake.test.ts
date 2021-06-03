import test from "ava";
import {withTypeScript} from "./util/ts-macro";
import {formatCode} from "./util/format-code";
import {generateRollupBundle} from "./setup/setup-rollup";
import {createExternalTestFiles} from "./setup/test-file";

test.serial("Tree-shakes correctly. #1", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			...createExternalTestFiles(
				"my-library",
				`\
				export enum Foo {}
				export enum Bar {}
				`
			),
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					import {Foo, Bar} from "my-library";
					export type Baz = Foo;
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
		import {Foo} from "my-library";
		type Baz = Foo;
		export {Baz};
		`)
	);
});

test.serial("Tree-shakes correctly. #2", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					export {bar} from "./foo";
					`
			},
			{
				entry: false,
				fileName: "foo.ts",
				text: `\
					export const foo = 2;
					export const bar = 3;
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
		declare const bar = 3;
		export {bar};
		`)
	);
});

test.serial("Tree-shakes correctly. #3", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					export {Foo} from "./foo";
					`
			},
			{
				entry: false,
				fileName: "foo.ts",
				text: `\
					import {Bar} from "./bar";
					export interface Foo {
						bar: Bar;
					}
					`
			},
			{
				entry: false,
				fileName: "bar.ts",
				text: `\
					import {Foo} from "./foo";
					export class Bar {
						bar: Foo;
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
			declare class Bar {
				bar: Foo;
			}
			interface Foo {
				bar: Bar;
			}
			export { Foo };
		`)
	);
});

test.serial("Tree-shakes correctly. #4", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					type A = string;
					type B = number;
					type C = symbol;
					export interface Foo {
						a: A;
						b: B;
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
			type A = string;
			type B = number;
			interface Foo {
				a: A;
				b: B;
			}
			export {Foo};
		`)
	);
});

test.serial("Tree-shakes correctly. #5", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					type A = string;
					export function foo<A> (arg: A): void {}
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
			declare function foo<A> (arg: A): void;
			export {foo};
		`)
	);
});

test.serial("Tree-shakes correctly. #6", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					declare global {
							interface Window {
									foo: string:
							}
					}`
			}
		],
		{
			typescript,
			debug: false,
			transpileOnly: true
		}
	);
	const {
		declarations: [file]
	} = bundle;
	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		declare global {
				interface Window {
						foo: string;
				}
		}
		export {};
		`)
	);
});

test.serial("Tree-shakes correctly. #7", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					const S = Symbol();

					export const f2 = {
						[S]: "";
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
		declare const S: unique symbol;
		declare const f2: {
				[S]: string;
		};
		export { f2 };
		`)
	);
});

test.serial("Tree-shakes correctly. #8", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
				const S = Symbol();
				export default {
					async [S] () {
						return;
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
		declare const S: unique symbol;
		declare const _default: {
    	[S](): Promise<void>;
		};
		export { _default as default };
		`)
	);
});
