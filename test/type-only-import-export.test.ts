import {test} from "./util/test-runner.js";
import {generateRollupBundle} from "./setup/setup-rollup.js";
import {formatCode} from "./util/format-code.js";

test.serial("Handles type-only imports and exports. #1", {ts: ">=3.8"}, async (t, {typescript, rollup}) => {
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
		interface Foo {}
		export type {Foo};
		`)
	);
});
