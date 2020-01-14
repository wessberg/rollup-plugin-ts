import test from "ava";
import {generateRollupBundle} from "./setup/setup-rollup";
import json from "@rollup/plugin-json";
import {formatCode} from "./util/format-code";

// tslint:disable:no-duplicate-string

test("Handles .JSON files that has been pre-transformed by other plugins. #1", async t => {
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
			debug: false,
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
