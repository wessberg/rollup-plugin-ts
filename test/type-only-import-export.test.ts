import test from "ava";
import {withTypeScriptVersions} from "./util/ts-macro";
import {generateRollupBundle} from "./setup/setup-rollup";
import {formatCode} from "./util/format-code";

test.serial("Handles type-only imports and exports. #1", withTypeScriptVersions(">=3.8"), async (t, {typescript}) => {
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
		{
			typescript,
			debug: false
		}
	);
	const {
		declarations: [file]
	} = bundle;
	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		interface Foo {}
		export type {Foo};
		`)
	);
});
