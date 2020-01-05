import test from "ava";
import {formatCode} from "./util/format-code";
import {generateRollupBundle} from "./setup/setup-rollup";
// tslint:disable:no-duplicate-string

test("Is still capable of resolving SourceFiles when needed for when a file path is matched by the 'exclude' glob. #1", async t => {
	const bundle = await generateRollupBundle(
		[
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
