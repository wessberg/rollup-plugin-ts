import test from "ava";
import {withTypeScript} from "./util/ts-macro.js";
import {formatCode} from "./util/format-code.js";
import {generateRollupBundle} from "./setup/setup-rollup.js";

test.serial("Preserves JSDoc comments in bundled declarations. #1", withTypeScript, async (t, {typescript}) => {
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

test.serial("Preserves JSDoc comments in bundled declarations. #2", withTypeScript, async (t, {typescript}) => {
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

test.serial("Preserves JSDoc comments in bundled declarations. #3", withTypeScript, async (t, {typescript}) => {
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

test.serial("Preserves JSDoc comments in bundled declarations. #4", withTypeScript, async (t, {typescript}) => {
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
					export {foo as bar} from "./b";
				`
			},
			{
				entry: false,
				fileName: "b.ts",
				text: `\
					/**
					 * @deprecated
					 */
					export function foo (): void {}
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
					 * @deprecated
					 */
					declare function foo (): void;
					export {foo as bar};
		`)
	);
});

test.serial("Preserves JSDoc comments in bundled declarations. #5", withTypeScript, async (t, {typescript}) => {
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
					export {foo as bar} from "./b";
				`
			},
			{
				entry: false,
				fileName: "b.ts",
				text: `\
					/**
					 * @see {@link bar}
					 * @see bar
					 */
					export function foo (): void {}
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
					 * @see {@link bar}
					 * @see bar
					 */
					declare function foo (): void;
					export {foo as bar};
		`)
	);
});

test.serial("Won't leave JSDoc annotations for tree-shaken nodes. #1", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: false,
				fileName: "child.ts",
				text: `\
				export interface ChildParams {
					/**
					 * Name parameter.
					 */
					name: string;
				}

				/**
				 * Child function.
				 */
				export default function child(options: ChildParams) {
					return options.name;
				}
			`
			},
			{
				entry: true,
				fileName: "parent.ts",
				text: `\
					import child, {ChildParams} from './child';

					export interface ParentParams {
						/**
						 * Child parameter.
						 */
						child: ChildParams;
					}
					
					/**
					 * Parent function.
					 */
					export default function parent(options: ParentParams) {
						return child(options.child);
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
		interface ChildParams {
				/**
				 * Name parameter.
				 */
				name: string;
		}
		interface ParentParams {
				/**
				 * Child parameter.
				 */
				child: ChildParams;
		}
		/**
		 * Parent function.
		 */
		declare function parent(options: ParentParams): string;
		export { ParentParams, parent as default };
		`)
	);
});
