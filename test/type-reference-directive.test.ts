import {test} from "./util/test-runner.js";
import {formatCode} from "./util/format-code.js";
import {generateRollupBundle} from "./setup/setup-rollup.js";
import {createBuiltInModuleTestFiles, createExternalTestFiles} from "./setup/test-file.js";

test.serial("Detects type reference directives and respects tree-shaking and code-splitting. #1", "*", async (t, {typescript, rollup}) => {
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
		/// <reference types="node" />
		import {readFileSync} from "fs";
		interface IFoo {
			foo: typeof readFileSync;
		}
		export {IFoo};
		`)
	);
});

test.serial("Detects type reference directives and respects tree-shaking and code-splitting. #2", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			...createBuiltInModuleTestFiles("buffer"),
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
		/// <reference types="node" />
		declare function foo(_arg: Buffer): void;
		export { foo };
		`)
	);
});

test.serial("Detects type reference directives and respects tree-shaking and code-splitting. #3", "*", async (t, {typescript, rollup}) => {
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
			/// <reference types="node" />
			interface IFoo {
					foo: typeof import("fs").readFileSync;
			}
			export { IFoo };
		`)
	);
});

test.serial("Detects type reference directives and respects tree-shaking and code-splitting. #4", "*", async (t, {typescript, rollup}) => {
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
			import {foo} from "my-library";
			interface IFoo {
					foo: typeof foo;
			}
			export { IFoo };
		`)
	);
});

test.serial("Detects type reference directives and respects tree-shaking and code-splitting. #5", "*", async (t, {typescript, rollup}) => {
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
			interface Foo {
    		error: Error;
			}
			export {Foo};
		`)
	);
});

test.serial("Detects type reference directives and respects tree-shaking and code-splitting. #6", "*", async (t, {typescript, rollup}) => {
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
			type Bar = Foo;
			export {Bar};
		`)
	);
});
