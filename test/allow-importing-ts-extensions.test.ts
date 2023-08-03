import {test} from "./util/test-runner.js";
import {formatCode} from "./util/format-code.js";
import {generateRollupBundle} from "./setup/setup-rollup.js";

test.serial(
	"Supports importing files by referencing their .ts extensions when the 'allowImportingTsExtensions' CompilerOption is set. #1",
	{ts: ">=5.0"},
	async (t, {typescript, rollup}) => {
		const bundle = await generateRollupBundle(
			[
				{
					entry: true,
					fileName: "index.ts",
					text: `\
					import {foo} from "./a.ts";
					console.log(foo);
					export {foo};
					`
				},
				{
					entry: false,
					fileName: "a.ts",
					text: `\
					export const foo = 2;
					`
				}
			],
			{
				typescript,
				rollup,
				tsconfig: {
					allowImportingTsExtensions: true
				}
			}
		);
		const {
			declarations: [file]
		} = bundle;

		t.deepEqual(
			formatCode(file.code),
			formatCode(`\
			declare const foo = 2;
			export { foo }
		`)
		);
	}
);
