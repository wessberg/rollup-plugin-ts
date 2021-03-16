import test from "ava";
import {withTypeScript} from "./util/ts-macro";
import {generateRollupBundle} from "./setup/setup-rollup";
import {formatCode} from "./util/format-code";

test("Won't break for .mjs imports, even though .mjs isn't supported. #1", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "source/index.ts",
				text: `\
					import "./my-file.mjs";
					`
			},
			{
				entry: false,
				fileName: "source/my-file.mjs",
				text: `\
					export const foo = 2;
				`
			}
		],
		{
			typescript,
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
			export {};
		`)
	);
});
