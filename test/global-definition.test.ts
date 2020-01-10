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
			debug: false
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

test("Will not add .d.ts files matched by imports to the Rollup graph when corresponding non-ambient files exist for them #1", async t => {
	await t.notThrowsAsync(
		generateRollupBundle(
			[
				{
					entry: true,
					fileName: "virtual-src/index.ts",
					text: `\
				import someDefaultValue from "../virtual-dist";
				console.log(someDefaultValue);

				`
				},
				{
					entry: false,
					fileName: "virtual-dist/index.d.ts",
					text: `\
				declare const foo = string;
				export { foo as default };
				`
				},
				{
					entry: false,
					fileName: "virtual-dist/index.js",
					text: `\
				const foo = "test";
				export {foo as default};
				`
				}
			],
			{
				debug: false
			}
		)
	);
});
