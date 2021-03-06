import test from "ava";
import {withTypeScript} from "./util/ts-macro";
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
