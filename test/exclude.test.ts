import test from "ava";
import {withTypeScript} from "./util/ts-macro";
import {formatCode} from "./util/format-code";
import {generateRollupBundle} from "./setup/setup-rollup";
import {createBuiltInModuleTestFiles} from "./setup/test-file";

test("Is still capable of resolving SourceFiles when needed for when a file path is matched by the 'exclude' glob. #1", withTypeScript, async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			...createBuiltInModuleTestFiles("globals"),
			{
				entry: true,
				fileName: "index.ts",
				text: `\
				export function foo (arg: Buffer): Buffer {
					return arg;
				}
				`
			}
		],
		{
			typescript,
			debug: false,
			exclude: ["node_modules/**/*.*"]
		}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		/// <reference types="node" />
		declare function foo(arg: Buffer): Buffer;
		export { foo };
	`)
	);
});
