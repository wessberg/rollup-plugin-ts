import test from "ava";
import {formatCode} from "./util/format-code";
import {generateRollupBundle} from "./setup/setup-rollup";
// tslint:disable:no-duplicate-string

test("Merges identical statements correctly. #1", async t => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					export function foo (_arg: Buffer): void {}
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
		/// <reference types="node" />
		declare function foo(_arg: Buffer): void;
		export { foo };
		`)
	);
});

test("Merges identical statements correctly. #2", async t => {
	const bundle = await generateRollupBundle([
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
	]);

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

test("Merges identical statements correctly. #3", async t => {
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
		{debug: false}
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

test("Merges identical statements correctly. #4", async t => {
	const bundle = await generateRollupBundle(
		[
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
		],
		{debug: false}
	);

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
