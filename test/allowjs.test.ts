import test from "ava";
import {formatCode} from "./util/format-code";
import {generateRollupBundle} from "./setup/setup-rollup";

// tslint:disable:no-duplicate-string
test("Won't fail for .js extensions when allowJs is false. #1", async t => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					export {Foo} from "./bar.js";
					`
			},
			{
				entry: false,
				fileName: "bar.js",
				text: `\
					export const Foo = 2;
					`
			}
		],
		{
			debug: false,
			tsconfig: {
				allowJs: false
			}
		}
	);
	const {
		bundle: {
			output: [file]
		}
	} = bundle;
	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		const Foo = 2;

		export { Foo };
		`)
	);
});

test("Can generate declarations for .js sources when 'allowJs' is true. #1", async t => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					export {Foo} from "./bar.js";
					`
			},
			{
				entry: false,
				fileName: "bar.js",
				text: `\
					export const Foo = 2;
					`
			}
		],
		{
			debug: false,
			tsconfig: {
				allowJs: true,
				declaration: true
			}
		}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		declare const Foo: 2;
		export { Foo };
		`)
	);
});
