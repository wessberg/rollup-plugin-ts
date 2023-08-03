import {test} from "./util/test-runner.js";
import {formatCode} from "./util/format-code.js";
import {generateRollupBundle} from "./setup/setup-rollup.js";

test.serial("Detects d.ts files when matched by a ParsedCommandLine. #1", "*", async (t, {typescript, rollup}) => {
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
			typescript,
			rollup,
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

test.serial("Will not add .d.ts files matched by imports to the Rollup graph when corresponding non-ambient files exist for them #1", "*", async (t, {typescript, rollup}) => {
	await t.notThrowsAsync(
		generateRollupBundle(
			[
				{
					entry: true,
					fileName: "src/index.ts",
					text: `\
				import someDefaultValue from "../dist";
				console.log(someDefaultValue);

				`
				},
				{
					entry: false,
					fileName: "dist/index.d.ts",
					text: `\
				declare const foo = string;
				export { foo as default };
				`
				},
				{
					entry: false,
					fileName: "dist/index.js",
					text: `\
				const foo = "test";
				export {foo as default};
				`
				}
			],
			{
				typescript,
				rollup,
				debug: false
			}
		)
	);
});

test.serial("Will not add .d.ts files matched by imports to the Rollup graph when corresponding non-ambient files exist for them #2", "*", async (t, {typescript, rollup}) => {
	await t.notThrowsAsync(
		generateRollupBundle(
			[
				{
					entry: true,
					fileName: "src/index.ts",
					text: `\
				import someDefaultValue from "../dist";
				console.log(someDefaultValue);

				`
				},
				{
					entry: false,
					fileName: "dist/index.d.ts",
					text: `\
				declare const foo = string;
				export { foo as default };
				`
				},
				{
					entry: false,
					fileName: "dist/index.js",
					text: `\
				const foo = "test";
				export {foo as default};
				`
				}
			],
			{
				typescript,
				rollup,
				debug: false,
				tsconfig: {
					allowJs: true
				}
			}
		)
	);
});
