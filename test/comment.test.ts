import test from "./util/test-runner";
import {formatCode} from "./util/format-code";
import {generateRollupBundle} from "./setup/setup-rollup";

test("Preserves JSDoc comments in bundled declarations. #1", async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					/**
					 * This is a JSDoc comment
					 */
					export interface Foo {
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
		/**
		 * This is a JSDoc comment
		 */
		interface Foo {
		}
		export {Foo};
		`)
	);
});

test("Preserves JSDoc comments in bundled declarations. #2", async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
				export * from "./a";
			`
			},
			{
				entry: false,
				fileName: "a.ts",
				text: `\
					/**
					 * This is a JSDoc comment
					 */
					export interface Foo {
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
		/**
		 * This is a JSDoc comment
		 */
		interface Foo {
		}
		export {Foo};
		`)
	);
});

test("Preserves JSDoc comments in bundled declarations. #3", async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
				export * from "./a";
			`
			},
			{
				entry: false,
				fileName: "a.ts",
				text: `\
					export {Foo as Bar} from "./b";
					`
			},
			{
				entry: false,
				fileName: "b.ts",
				text: `\
					export class Foo {
					 /**
					  * Does something
					  * @returns {void}
					  */
						doFoo(): void {}
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
		declare class Foo {
		  /**
		   * Does something
       * @returns {void}
       */
       doFoo(): void;
     }
     export {Foo as Bar};
		`)
	);
});
