import test from "./util/test-runner";
import {generateRollupBundle} from "./setup/setup-rollup";
import {lt} from "semver";

test("Can generate .tsbuildinfo for a compilation unit. #1", async (t, {typescript}) => {
	if (lt(typescript.version, "3.4.0")) {
		t.pass(`Current TypeScript version (${typescript.version} does not support the 'incremental' option Skipping...`);
		return;
	}

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
				outDir: "virtual-dist",
				composite: true,
				incremental: true,
				declaration: true
			}
		}
	);
	const {buildInfo} = bundle;
	t.true(buildInfo != null);
});

test("Won't break for older TypeScript versions. #1", async (t, {typescript}) => {
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
					outDir: "virtual-dist",
					composite: true,
					declaration: true
				}
			}
		),
		`Did throw for TypeScript ${typescript.version}`
	);
});

test("Can generate .tsbuildinfo for a compilation unit. #2", async (t, {typescript}) => {
	if (lt(typescript.version, "3.4.0")) {
		t.pass(`Current TypeScript version (${typescript.version} does not support the 'incremental' option Skipping...`);
		return;
	}

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
							"outDir": "virtual-dist",
							"composite": true,
							"declaration": true
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
