import test from "ava";
import {formatCode} from "./util/format-code";
import {generateRollupBundle} from "./setup/setup-rollup";

test("Handles circular, self-referencing exports. #1", async t => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					export * from "./index";
					`
			}
		],
		{
			debug: false
		}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			export {};
		`)
	);
});

test("Handles circular, self-referencing exports. #2", async t => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					export * from "./index";
					export {Foo as Bar} from "./bar";
					`
			},
			{
				entry: false,
				fileName: "bar.ts",
				text: `\
					export const Foo = 2;
					`
			}
		],
		{
			debug: false
		}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			declare const Foo = 2;
			export {Foo as Bar};
		`)
	);
});
