import {test} from "./util/test-runner.js";
import {formatCode} from "./util/format-code.js";
import {generateRollupBundle} from "./setup/setup-rollup.js";
import {createExternalTestFiles} from "./setup/test-file.js";

test.serial("Tree-shakes correctly. #1", "*", async (t, {typescript, rollup}) => {
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
		import {Foo} from "my-library";
		type Baz = Foo;
		export {Baz};
		`)
	);
});

test.serial("Tree-shakes correctly. #2", "*", async (t, {typescript, rollup}) => {
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
		declare const bar = 3;
		export {bar};
		`)
	);
});

test.serial("Tree-shakes correctly. #3", "*", async (t, {typescript, rollup}) => {
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

test.serial("Tree-shakes correctly. #4", "*", async (t, {typescript, rollup}) => {
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

test.serial("Tree-shakes correctly. #5", "*", async (t, {typescript, rollup}) => {
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
			declare function foo<A> (arg: A): void;
			export {foo};
		`)
	);
});

test.serial("Tree-shakes correctly. #6", "*", async (t, {typescript, rollup}) => {
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
			rollup,
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

test.serial("Tree-shakes correctly. #7", "*", async (t, {typescript, rollup}) => {
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
		declare const S: unique symbol;
		declare const f2: {
				[S]: string;
		};
		export { f2 };
		`)
	);
});

test.serial("Tree-shakes correctly. #8", "*", async (t, {typescript, rollup}) => {
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
		declare const S: unique symbol;
		declare const _default: {
    	[S](): Promise<void>;
		};
		export { _default as default };
		`)
	);
});
