import test from "ava";
import {generateRollupBundle} from "./setup/setup-rollup";

// tslint:disable:no-duplicate-string
test("Doesn't break when combining @babel/preset-env with the useBuiltins: 'usage' option. #1", async t => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					console.log([].includes(2));
					`
			}
		],
		{
			debug: false,
			transpiler: "babel",
			exclude: [],
			babelConfig: {
				presets: [
					[
						"@babel/preset-env",
						{
							useBuiltIns: "usage",
							corejs: {version: 3, proposals: true}
						}
					]
				]
			}
		}
	);
	const {
		js: [file]
	} = bundle;
	t.true(file.code.includes(`addToUnscopables('includes')`));
});
