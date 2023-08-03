import {test} from "./util/test-runner.js";
import {generateRollupBundle} from "./setup/setup-rollup.js";
import {formatCode} from "./util/format-code.js";

test.serial("Won't break for .cjs imports, for TypeScript versions where .cjs isn't supported. #1", {ts: "<4.7"}, async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "source/index.ts",
				text: `\
					import "./my-file.cjs";
					`
			},
			{
				entry: false,
				fileName: "source/my-file.cjs",
				text: `\
					export const foo = 2;
				`
			}
		],
		{
			typescript,
			rollup,
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

test.serial("Supports .cjs imports for TypeScript versions where .cjs is supported. #1", {ts: ">=4.7"}, async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "source/index.ts",
				text: `\
					export {foo} from "./my-file.cjs";
					`
			},
			{
				entry: false,
				fileName: "source/my-file.cjs",
				text: `\
					export const foo = 2;
				`
			}
		],
		{
			typescript,
			rollup,
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

test.serial("Will generate a .d.cts declaration file when the output file is .cjs based. #1", {ts: ">=4.7"}, async (t, {typescript, rollup}) => {
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
			rollup,
			debug: false,
			tsconfig: {
				declaration: true
			},
			rollupOptions: {
				output: {
					file: "index.cjs"
				}
			}
		}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(file.fileName, `index.d.cts`);
});

test.serial(
	"Will generate a .d.ts declaration file when the output file is .cjs, but the TypeScript version doesn't support the .d.cts format based. #1",
	{ts: "<4.7"},
	async (t, {typescript, rollup}) => {
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
				rollup,
				debug: false,
				tsconfig: {
					declaration: true
				},
				rollupOptions: {
					output: {
						file: "index.cjs"
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

test.serial("Can successfully author in .cts files. #1", {ts: ">=4.7"}, async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "source/index.cts",
				text: `\
					export {type Foo} from "./foo.cjs";
					`
			},
			{
				entry: false,
				fileName: "source/foo.cts",
				text: `\
					export type Foo = string;
					`
			}
		],
		{
			typescript,
			rollup,
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
