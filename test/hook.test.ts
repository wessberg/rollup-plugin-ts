import test from "ava";
import {formatCode} from "./util/format-code";
import {generateRollupBundle} from "./setup/setup-rollup";
// tslint:disable:no-duplicate-string

test("Declarations respect rewritten output paths. #1", async t => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					import {Foo} from "./foo";
					export {Foo}
					`
			},
			{
				entry: false,
				fileName: "foo.ts",
				text: `\
					export type Foo = string;
					`
			}
		],
		{
			debug: false,
			tsconfig: {
				declarationMap: true,
				declarationDir: "./foobarbaz"
			},
			hook: {
				outputPath: path => path.replace("index.d.ts", "some-other-dir/hey/there/index-rewritten.d.ts")
			}
		}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		type Foo = string;
		export {Foo};
		//# sourceMappingURL=index-rewritten.d.ts.map
		`)
	);
});

test("Diagnostics can be filtered with the 'diagnostics' hook. #1", async t => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
					export const foo: number = String(2);
					`
			}
		],
		{
			hook: {
				diagnostics: () => undefined
			}
		}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		declare const foo: number;
		export {foo};
		`)
	);
});
