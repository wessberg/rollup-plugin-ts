import test from "ava";
import {withTypeScriptVersions} from "./util/ts-macro.js";
import {generateRollupBundle} from "./setup/setup-rollup.js";
import {formatCode} from "./util/format-code.js";

test.serial("Won't break for .mjs imports, for TypeScript versions where .mjs isn't supported. #1", withTypeScriptVersions("<4.7"), async (t, {typescript}) => {
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

test.serial("Supports .mjs imports for TypeScript versions where .mjs is supported. #1", withTypeScriptVersions(">=4.7"), async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "source/index.ts",
				text: `\
					export {foo} from "./my-file.mjs";
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
		declare const foo: 2;
		export { foo };
		`)
	);
});

test.serial("Will generate a .d.mts declaration file when the output file is .mjs based. #1", withTypeScriptVersions(">=4.7"), async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "source/index.ts",
				text: `\
					export type Foo = string;
					`
			}
		],
		{
			typescript,
			debug: false,
			tsconfig: {
				declaration: true
			},
			rollupOptions: {
				output: {
					file: "index.mjs"
				}
			}
		}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(file.fileName, `index.d.mts`);
});

test.serial(
	"Will generate a .d.ts declaration file when the output file is .mjs, but the TypeScript version doesn't support the .d.mts format based. #1",
	withTypeScriptVersions("<4.7"),
	async (t, {typescript}) => {
		const bundle = await generateRollupBundle(
			[
				{
					entry: true,
					fileName: "source/index.ts",
					text: `\
					export type Foo = string;
					`
				}
			],
			{
				typescript,
				debug: false,
				tsconfig: {
					declaration: true
				},
				rollupOptions: {
					output: {
						file: "index.mjs"
					}
				}
			}
		);
		const {
			declarations: [file]
		} = bundle;

		t.deepEqual(file.fileName, `index.d.ts`);
	}
);

test.serial("Can successfully author in .mts files. #1", withTypeScriptVersions(">=4.7"), async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "source/index.mts",
				text: `\
					export {type Foo} from "./foo.mjs";
					`
			},
			{
				entry: false,
				fileName: "source/foo.mts",
				text: `\
					export type Foo = string;
					`
			}
		],
		{
			typescript,
			debug: false,
			tsconfig: {
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
			type Foo = string;
			export { Foo };
		`)
	);
});
