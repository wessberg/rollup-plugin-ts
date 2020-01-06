import test from "ava";
import * as TS301 from "typescript-3-0-1";
import * as TS311 from "typescript-3-1-1";
import * as TS321 from "typescript-3-2-1";
import * as TS331 from "typescript-3-3-1";
import {generateRollupBundle} from "./setup/setup-rollup";

// tslint:disable:no-duplicate-string
test("Can generate .tsbuildinfo for a compilation unit. #1", async t => {
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

test("Won't break for older TypeScript versions. #1", async t => {
	for (const [TS, version] of [
		[TS301, "v3.0.1"],
		[TS311, "v3.1.1"],
		[TS321, "v3.2.1"],
		[TS331, "v3.3.1"]
	]) {
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
					typescript: (TS as unknown) as typeof import("typescript"),
					tsconfig: {
						outDir: "dist",
						composite: true,
						declaration: true
					}
				}
			),
			`Did throw for TypeScript ${version}`
		);
	}
});
