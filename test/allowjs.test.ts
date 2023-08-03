import {test} from "./util/test-runner.js";
import {formatCode} from "./util/format-code.js";
import {generateRollupBundle} from "./setup/setup-rollup.js";

test.serial("Won't fail for .js extensions when allowJs is false. #1", "*", async (t, {typescript, rollup}) => {
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
			rollup,
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

test.serial("Can generate declarations for .js sources when 'allowJs' is true. #1", {ts: ">=3.7"}, async (t, {typescript, rollup}) => {
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
			rollup,
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
