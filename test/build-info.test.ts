import test from "ava";
import {withTypeScript} from "./util/ts-macro";
import {generateRollupBundle} from "./setup/setup-rollup";

test("Can generate .tsbuildinfo for a compilation unit. #1", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					export {};
					`
			}
		],
		{
			debug: false,
			typescript,
			tsconfig: {
				outDir: "dist",
				composite: true,
				incremental: true,
				declaration: true
			}
		}
	);
	const {buildInfo} = bundle;
	t.true(buildInfo != null);
});

test("Won't break for older TypeScript versions. #1", withTypeScript, async (t, {typescript}) => {
	await t.notThrowsAsync(
		generateRollupBundle(
			[
				{
					entry: true,
					fileName: "index.ts",
					text: `\
					export {};
					`
				}
			],
			{
				debug: false,
				typescript,
				tsconfig: {
					outDir: "dist",
					composite: true,
					declaration: true
				}
			}
		),
		`Did throw for TypeScript ${typescript.version}`
	);
});

test.serial("Can generate .tsbuildinfo for a compilation unit. #2", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "source/index.ts",
				text: `\
					import("./foo");
					`
			},
			{
				entry: false,
				fileName: "source/foo.ts",
				text: `\
					export type Foo = string;
					`
			},
			{
				entry: false,
				fileName: "tsconfig.json",
				text: `\
					{
						"compilerOptions": {
							"outDir": "dist",
							"composite": true,
							"declaration": true,
							"lib": ["esnext"]
						},
						"include": [
							"./source/**/*"
						]
					}
					`
			}
		],
		{
			debug: false,
			typescript,
			tsconfig: "tsconfig.json"
		}
	);
	const {buildInfo} = bundle;
	t.true(buildInfo != null);
});
