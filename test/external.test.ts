/* eslint-disable @typescript-eslint/naming-convention */
import {test} from "./util/test-runner.js";
import {formatCode} from "./util/format-code.js";
import {generateRollupBundle} from "./setup/setup-rollup.js";
import path from "crosspath";

test.serial("Won't inline modules marked as external. #1", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "source/index.ts",
				text: `\
					export * from "./foo";
				`
			},
			{
				entry: false,
				fileName: "source/foo.ts",
				text: `\
					export const Foo = "hello";
				`
			}
		],
		{
			typescript,
			rollup,
			debug: false,
			rollupOptions: {
				external: p => !path.normalize(p).endsWith(`source/index.ts`)
			}
		}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			export * from "./foo";
		`)
	);
});

test.serial("Won't inline modules marked as external. #2", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					export * from "@/foo";
				`
			},
			{
				entry: false,
				fileName: "foo.ts",
				text: `\
					export const Foo = "foo";
				`
			}
		],
		{
			typescript,
			rollup,
			debug: false,
			rollupOptions: {
				external: p => !path.normalize(p).endsWith(`index.ts`)
			},
			tsconfig: {
				paths: {
					// eslint-disable-next-line @typescript-eslint/naming-convention
					"@/*": ["*"]
				}
			}
		}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			export * from "@/foo";
		`)
	);
});

test.serial("Won't inline modules marked as external. #3", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					export * from "@/foo";
					export * from "@/baz";
				`
			},
			{
				entry: false,
				fileName: "foo.ts",
				text: `\
					export * from "./bar";
				`
			},
			{
				entry: false,
				fileName: "bar.ts",
				text: `\
					export const Foo = "hello";
					export * from "./bar2";
				`
			},
			{
				entry: false,
				fileName: "bar2.ts",
				text: `\
					export const Barr = "hi";
				`
			},
			{
				entry: false,
				fileName: "baz.ts",
				text: `\
					export const Baz = "hello";
				`
			}
		],
		{
			typescript,
			rollup,
			debug: false,
			rollupOptions: {
				external: "@/foo"
			},
			tsconfig: {
				paths: {
					"@/*": ["*"]
				}
			}
		}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			declare const Baz = "hello";
			export * from "@/foo";
			export { Baz };
		`)
	);
});
