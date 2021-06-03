import test from "ava";
import {withTypeScript} from "./util/ts-macro";
import {formatCode} from "./util/format-code";
import {generateRollupBundle} from "./setup/setup-rollup";
import {createBuiltInModuleTestFiles, createExternalTestFiles} from "./setup/test-file";

test("Detects type reference directives and respects tree-shaking and code-splitting. #1", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			...createBuiltInModuleTestFiles("fs"),
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
			...createBuiltInModuleTestFiles("globals"),
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
			...createBuiltInModuleTestFiles("fs"),
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

test.serial("Detects type reference directives and respects tree-shaking and code-splitting. #4", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			...createExternalTestFiles(
				"my-library",
				`\
				export function foo (): void;
				`
			),
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					import {foo} from "my-library";
					export interface IFoo {
						foo: typeof foo;
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
			import {foo} from "my-library";
			interface IFoo {
					foo: typeof foo;
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
			...createExternalTestFiles(
				"my-library",
				`\
				export type Foo = 2;
				`
			),
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					import {Foo} from "my-library";
					export type Bar = Foo;
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
			type Bar = Foo;
			export {Bar};
		`)
	);
});
