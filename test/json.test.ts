import {test} from "./util/test-runner.js";
import {generateRollupBundle} from "./setup/setup-rollup.js";
import json from "@rollup/plugin-json";
import {formatCode} from "./util/format-code.js";

test.serial("Handles .JSON files that has been pre-transformed by other plugins. #1", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					import {name} from "./foo.json";
					console.log(name);
					`
			},
			{
				entry: false,
				fileName: "foo.json",
				text: `\
					{
						"name": "Foo"
					}
					`
			}
		],
		{
			typescript,
			rollup,
			debug: false,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			prePlugins: [json()],
			tsconfig: {
				resolveJsonModule: true
			}
		}
	);
	const {
		js: [file]
	} = bundle;
	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		var name = "Foo";

		console.log(name);
		`)
	);
});
