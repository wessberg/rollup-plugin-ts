import test from "ava";
import {formatCode} from "./util/format-code";
import {generateRollupBundle} from "./setup/setup-rollup";

test("Supports overloaded functions. #1", async t => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
        export function foo (arg: number): number;
				export function foo (arg: string): string;
				export function foo (arg: number|string): number|string {
					return arg;
				}
			`
			}
		],
		{
			debug: false
		}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		declare function foo(arg: number): number;
		declare function foo(arg: string): string;
		export { foo };
		`)
	);
});
