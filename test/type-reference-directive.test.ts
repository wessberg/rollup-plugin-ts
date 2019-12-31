import test from "ava";
import {formatCode} from "./util/format-code";
import {generateRollupBundle} from "./setup/setup-rollup";
// tslint:disable:no-duplicate-string

test("Detects type reference directives and respects tree-shaking and code-splitting. #1", async t => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					import {readFileSync} from "fs";

					export interface IFoo {
						foo: typeof readFileSync;
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
		/// <reference types="node" />
		import {readFileSync} from "fs";
		interface IFoo {
			foo: typeof readFileSync;
		}
		export {IFoo};
		`)
	);
});

test("Detects type reference directives and respects tree-shaking and code-splitting. #2", async t => {
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

test("Detects type reference directives and respects tree-shaking and code-splitting. #3", async t => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\

					export interface IFoo {
						foo: typeof import("fs").readFileSync;
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
			/// <reference types="node" />
			interface IFoo {
					foo: typeof import("fs").readFileSync;
			}
			export { IFoo };
		`)
	);
});

test("Detects type reference directives and respects tree-shaking and code-splitting. #4", async t => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					import {format} from "prettier";
					export interface IFoo {
						foo: typeof format;
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
			import {format} from "prettier";
			interface IFoo {
					foo: typeof format;
			}
			export { IFoo };
		`)
	);
});
