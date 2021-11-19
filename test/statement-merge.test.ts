import test from "ava";
import {withTypeScript, withTypeScriptVersions} from "./util/ts-macro";
import {formatCode} from "./util/format-code";
import {generateRollupBundle} from "./setup/setup-rollup";
import {createExternalTestFiles} from "./setup/test-file";

test.serial("Merges identical statements correctly. #1", withTypeScript, async (t, {typescript}) => {
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
			export * from "./a";
		`)
	);
});

test.serial("Merges identical statements correctly. #2", withTypeScript, async (t, {typescript}) => {
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
			export { foo as bar } from "./a";
		`)
	);
});

test.serial("Merges identical statements correctly. #3", withTypeScript, async (t, {typescript}) => {
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

test.serial("Merges identical statements correctly. #4", withTypeScriptVersions(">=3.8"), async (t, {typescript}) => {
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
			typescript
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

test.serial("Merges identical statements correctly. #5", withTypeScriptVersions(">=3.8"), async (t, {typescript}) => {
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
			typescript
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
		export type { foo as bar } from "./a";
		export { foo as baz } from "./a"
		`)
	);
});

test.serial("Merges identical statements correctly. #6", withTypeScriptVersions(">=4.5"), async (t, {typescript}) => {
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
			typescript
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
		export type { foo as bar } from "./a";
		export { bar as baz, foo as foobarbaz } from "./a";
		`)
	);
});

test.serial("Merges identical statements correctly. #7", withTypeScriptVersions(">=3.8"), async (t, {typescript}) => {
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
			typescript
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
		export { foo } from "./a";
		`)
	);
});
