import test from "./util/test-runner";
import {formatCode} from "./util/format-code";
import {generateRollupBundle} from "./setup/setup-rollup";
import {lt} from "semver";

test("Handles namespace exports. #1", async (t, {typescript}) => {
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

test("Handles namespace exports. #2", async (t, {typescript}) => {
	if (lt(typescript.version, "3.8.0")) {
		t.pass(`Current TypeScript version (${typescript.version} does not support 'export * as Foo from "..."' syntax. Skipping...`);
		return;
	}

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

test("Handles namespace exports. #3", async (t, {typescript}) => {
	if (lt(typescript.version, "3.8.0")) {
		t.pass(`Current TypeScript version (${typescript.version} does not support 'export * as Foo from "..."' syntax. Skipping...`);
		return;
	}

	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "index.ts",
				text: `\
          		export * as Foo from "ava";
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
	t.deepEqual(formatCode(file.code), formatCode(`export * as Foo from "ava";`));
});
