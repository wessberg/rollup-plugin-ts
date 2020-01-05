import test from "ava";
import {formatCode} from "./util/format-code";
import {generateRollupBundle} from "./setup/setup-rollup";
// tslint:disable:no-duplicate-string

test("Detects d.ts files when matched by a ParsedCommandLine. #1", async t => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
				export const foo = globalFunc();
				`
			},
			{
				entry: false,
				fileName: "typings/typings.d.ts",
				text: `\
				declare function globalFunc(): string;
				`
			}
		],
		{
			debug: false,
			exclude: ["node_modules/**/*.*"]
		}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			declare const foo: string;
			export {foo};
		`)
	);
});
