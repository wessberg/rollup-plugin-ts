import test from "ava";
import {withTypeScript, withTypeScriptVersions} from "./util/ts-macro";
import {formatCode} from "./util/format-code";
import {generateRollupBundle} from "./setup/setup-rollup";

test("Won't fail for .js extensions when allowJs is false. #1", withTypeScript, async (t, {typescript}) => {
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
			typescript,
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

test("Can generate declarations for .js sources when 'allowJs' is true. #1", withTypeScriptVersions(">=3.7"), async (t, {typescript}) => {
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
			typescript,
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
