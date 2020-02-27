import test from "ava";
import {formatCode} from "./util/format-code";
import {generateRollupBundle} from "./setup/setup-rollup";

test("Handles namespace exports. #1", async t => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
          		import * as Foo from "./foo";
							export { Foo }
        	`
			},
			{
				entry: false,
				fileName: "foo.ts",
				text: `\
				import { Bar } from "./bar";

				export interface Foo {
					a: number
					bar: Bar
				}
				`
			},
			{
				entry: false,
				fileName: "bar.ts",
				text: `\
				export interface Bar {
					b: number;
				}
				`
			}
		],
		{debug: false}
	);
	const {
		declarations: [file]
	} = bundle;
	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			declare namespace Foo {
					interface Bar {
							b: number;
					}
					interface Foo {
							a: number;
							bar: Bar;
					}
			}
			export { Foo };
		`)
	);
});

test("Handles namespace exports. #2", async t => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
          		export * as Foo from "./foo";
        	`
			},
			{
				entry: false,
				fileName: "foo.ts",
				text: `\
				import { Bar } from "./bar";

				export interface Foo {
					a: number
					bar: Bar
				}
				`
			},
			{
				entry: false,
				fileName: "bar.ts",
				text: `\
				export interface Bar {
					b: number;
				}
				`
			}
		],
		{debug: false}
	);
	const {
		declarations: [file]
	} = bundle;
	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			declare namespace Foo {
					interface Bar {
							b: number;
					}
					interface Foo {
							a: number;
							bar: Bar;
					}
			}
			export { Foo };
		`)
	);
});
