import test from "./util/test-runner";
import {generateRollupBundle} from "./setup/setup-rollup";
import {formatCode} from "./util/format-code";
import {lt} from "semver";

test("Handles type-only imports and exports. #1", async (t, {typescript}) => {
	if (lt(typescript.version, "3.8.0")) {
		t.pass(`Current TypeScript version (${typescript.version} does not support 'import type {...}' syntax. Skipping...`);
		return;
	}
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
