import test from "ava";
import {generateRollupBundle} from "./setup/setup-rollup";
import {NEW_LINE} from "./util/new-line";

test("Handles type-only imports and exports. #1", async t => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
          import type { Foo } from "./foo";
					export type { Foo };
        	`
			},
			{
				entry: false,
				fileName: "foo.ts",
				text: `\
				interface Foo {}
				export type {Foo};
				`
			}
		],
		{debug: false}
	);
	const {
		declarations: [file]
	} = bundle;
	t.deepEqual(
		file.code,
		`\
interface Foo {${NEW_LINE}}${NEW_LINE}export type { Foo };${NEW_LINE}`
	);
});
