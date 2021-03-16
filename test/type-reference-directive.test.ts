import test from "ava";
import {withTypeScript} from "./util/ts-macro";
import {formatCode} from "./util/format-code";
import {generateRollupBundle} from "./setup/setup-rollup";

test("Detects type reference directives and respects tree-shaking and code-splitting. #1", withTypeScript, async (t, {typescript}) => {
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
		/// <reference types="node" />
		import {readFileSync} from "fs";
		interface IFoo {
			foo: typeof readFileSync;
		}
		export {IFoo};
		`)
	);
});

test("Detects type reference directives and respects tree-shaking and code-splitting. #2", withTypeScript, async (t, {typescript}) => {
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
		/// <reference types="node" />
		declare function foo(_arg: Buffer): void;
		export { foo };
		`)
	);
});

test("Detects type reference directives and respects tree-shaking and code-splitting. #3", withTypeScript, async (t, {typescript}) => {
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
			/// <reference types="node" />
			interface IFoo {
					foo: typeof import("fs").readFileSync;
			}
			export { IFoo };
		`)
	);
});

test("Detects type reference directives and respects tree-shaking and code-splitting. #4", withTypeScript, async (t, {typescript}) => {
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
			import {format} from "prettier";
			interface IFoo {
					foo: typeof format;
			}
			export { IFoo };
		`)
	);
});

test("Detects type reference directives and respects tree-shaking and code-splitting. #5", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					export interface Foo {
						error: Error;
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
			interface Foo {
    		error: Error;
			}
			export {Foo};
		`)
	);
});

test("Detects type reference directives and respects tree-shaking and code-splitting. #6", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					import {SemVer} from "semver";
					export type Foo = SemVer;
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
			import {SemVer} from "semver";
			type Foo = SemVer;
			export {Foo};
		`)
	);
});
