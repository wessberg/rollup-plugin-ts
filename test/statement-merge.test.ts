import {test} from "./util/test-runner.js";
import {formatCode} from "./util/format-code.js";
import {generateRollupBundle} from "./setup/setup-rollup.js";
import {createExternalTestFiles} from "./setup/test-file.js";

test.serial("Merges identical statements correctly. #1", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					export * from "./bar";
					export * from "./baz";
					`
			},
			{
				entry: false,
				fileName: "bar.ts",
				text: `\
					export * from "./a";
					`
			},
			{
				entry: false,
				fileName: "baz.ts",
				text: `\
					export * from "./a";
					`
			},
			{
				entry: true,
				fileName: "a.ts",
				text: `\
					export const foo = 2;
					`
			}
		],
		{
			typescript,
			rollup,
			debug: false
		}
	);

	const {declarations} = bundle;

	const indexFile = declarations.find(file => file.fileName.includes("index.d.ts"));
	const aFile = declarations.find(file => file.fileName.includes("a.d.ts"));
	t.true(indexFile != null);
	t.true(aFile != null);

	t.deepEqual(
		formatCode(indexFile!.code),
		formatCode(`\
			export * from "./a.js";
		`)
	);
});

test.serial("Merges identical statements correctly. #2", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					export * from "./bar";
					export * from "./baz";
					`
			},
			{
				entry: false,
				fileName: "bar.ts",
				text: `\
					export {foo as bar} from "./a";
					`
			},
			{
				entry: false,
				fileName: "baz.ts",
				text: `\
					export {foo as bar} from "./a";
					`
			},
			{
				entry: true,
				fileName: "a.ts",
				text: `\
					export const foo = 2;
					`
			}
		],
		{
			typescript,
			rollup,
			debug: false
		}
	);

	const {declarations} = bundle;

	const indexFile = declarations.find(file => file.fileName.includes("index.d.ts"));
	const aFile = declarations.find(file => file.fileName.includes("a.d.ts"));
	t.true(indexFile != null);
	t.true(aFile != null);

	t.deepEqual(
		formatCode(indexFile!.code),
		formatCode(`\
			export { foo as bar } from "./a.js";
		`)
	);
});

test.serial("Merges identical statements correctly. #3", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			...createExternalTestFiles(
				"my-library",
				`\
				export declare class MyClass {}
				`
			),
			{
				entry: true,
				fileName: "index.ts",
				text: `\
          import {MyClass} from './bar';
					import {Bar} from "./bar";
          export interface Foo extends Bar {
            x: MyClass;
          }
					`
			},
			{
				entry: false,
				fileName: "bar.ts",
				text: `\
          export {MyClass} from 'my-library';
					export interface Bar {
						a: string;
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
			import { MyClass } from "my-library";
			interface Bar {
				a: string;
			}
			interface Foo extends Bar {
				x: MyClass;
			}
			export {Foo};
		`)
	);
});

test.serial("Merges identical statements correctly. #4", {ts: ">=3.8"}, async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
				export type { Foo } from "./foo";
				export { createFoo } from "./foo";
					`
			},
			{
				entry: false,
				fileName: "foo.ts",
				text: `\
				export type Foo = string;
				export function createFoo (): Foo {
					return "";
				};
					`
			}
		],
		{
			typescript,
			rollup
		}
	);

	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		type Foo = string;
		declare function createFoo(): Foo;
		export type { Foo };
		export {createFoo};
		`)
	);
});

test.serial("Merges identical statements correctly. #5", {ts: ">=3.8"}, async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					export * from "./bar";
					export * from "./baz";
					`
			},
			{
				entry: false,
				fileName: "bar.ts",
				text: `\
					export type {foo as bar} from "./a";
					`
			},
			{
				entry: false,
				fileName: "baz.ts",
				text: `\
					export {foo as baz} from "./a";
					`
			},
			{
				entry: true,
				fileName: "a.ts",
				text: `\
					export const foo = 2;
					`
			}
		],
		{
			typescript,
			rollup
		}
	);

	const {declarations} = bundle;

	const indexFile = declarations.find(file => file.fileName.includes("index.d.ts"));
	const aFile = declarations.find(file => file.fileName.includes("a.d.ts"));
	t.true(indexFile != null);
	t.true(aFile != null);

	t.deepEqual(
		formatCode(indexFile!.code),
		formatCode(`\
		export type { foo as bar } from "./a.js";
		export { foo as baz } from "./a.js"
		`)
	);
});

test.serial("Merges identical statements correctly. #6", {ts: ">=4.5"}, async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					export * from "./bar";
					export * from "./baz";
					`
			},
			{
				entry: false,
				fileName: "bar.ts",
				text: `\
					export {type foo as bar, bar as baz} from "./a";
					`
			},
			{
				entry: false,
				fileName: "baz.ts",
				text: `\
					export {foo as foobarbaz} from "./a";
					`
			},
			{
				entry: true,
				fileName: "a.ts",
				text: `\
					export const foo = 2;
					export const bar = 3;
					`
			}
		],
		{
			typescript,
			rollup
		}
	);

	const {declarations} = bundle;

	const indexFile = declarations.find(file => file.fileName.includes("index.d.ts"));
	const aFile = declarations.find(file => file.fileName.includes("a.d.ts"));
	t.true(indexFile != null);
	t.true(aFile != null);

	t.deepEqual(
		formatCode(indexFile!.code),
		formatCode(`\
		export type { foo as bar } from "./a.js";
		export { bar as baz, foo as foobarbaz } from "./a.js";
		`)
	);
});

test.serial("Merges identical statements correctly. #7", {ts: ">=3.8"}, async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					export * from "./bar";
					export * from "./baz";
					`
			},
			{
				entry: false,
				fileName: "bar.ts",
				text: `\
					export type {foo} from "./a";
					`
			},
			{
				entry: false,
				fileName: "baz.ts",
				text: `\
					export {foo} from "./a";
					`
			},
			{
				entry: true,
				fileName: "a.ts",
				text: `\
					export const foo = 2;
					`
			}
		],
		{
			typescript,
			rollup
		}
	);

	const {declarations} = bundle;

	const indexFile = declarations.find(file => file.fileName.includes("index.d.ts"));
	const aFile = declarations.find(file => file.fileName.includes("a.d.ts"));
	t.true(indexFile != null);
	t.true(aFile != null);

	t.deepEqual(
		formatCode(indexFile!.code),
		formatCode(`\
		export { foo } from "./a.js";
		`)
	);
});
