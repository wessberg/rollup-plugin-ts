import {test} from "./util/test-runner.js";
import {formatCode} from "./util/format-code.js";
import {generateRollupBundle} from "./setup/setup-rollup.js";
import {createExternalTestFiles} from "./setup/test-file.js";

test.serial("Handles namespace exports. #1", "*", async (t, {typescript, rollup}) => {
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
			rollup,
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

test.serial("Handles namespace exports. #2", {ts: ">=3.8"}, async (t, {typescript, rollup}) => {
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
			rollup,
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

test.serial("Handles namespace exports. #3", {ts: ">=3.8"}, async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			...createExternalTestFiles(
				"my-library",
				`\
				export declare const foo = 2;
				export declare const bar = 3;
				export default 2;
				`
			),
			{
				entry: true,
				fileName: "index.ts",
				text: `\
          		export * as Foo from "my-library";
        	`
			}
		],
		{
			typescript,
			rollup,
			debug: false
		}
	);
	const {
		declarations: [file]
	} = bundle;
	t.deepEqual(formatCode(file.code), formatCode(`export * as Foo from "my-library";`));
});

test.serial("Handles namespace exports. #4", {ts: ">=3.8"}, async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			...createExternalTestFiles(
				"my-library",
				`\
				export interface Subscribable {
					subscribe (): void;
					unsubscribe (): void;
				}
				`
			),
			{
				entry: true,
				fileName: "src/index.ts",
				text: `\
          		export * as Foo from "./foo";
          		export * as Bar from "./bar";
        	`
			},
			{
				entry: false,
				fileName: "src/foo.ts",
				text: `\
				import { Subscribable } from 'my-library';

				export interface Foo extends Subscribable {
					a: number
				}
				`
			},
			{
				entry: false,
				fileName: "src/bar.ts",
				text: `\
				import { Subscribable } from 'my-library';

				export interface Bar extends Subscribable {
					b: number;
				}
				`
			}
		],
		{
			typescript,
			rollup,
			debug: false
		}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			import { Subscribable } from "my-library";
			declare namespace Foo {
					interface Foo extends Subscribable {
							a: number;
					}
			}
			declare namespace Bar {
				interface Bar extends Subscribable {
						b: number;
				}
		}
			export { Foo, Bar };
		`)
	);
});

test.serial("Handles namespace exports. #5", {ts: ">=3.8"}, async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "src/index.ts",
				text: `\
        export * as Bar from "./foo";
			`
			},
			{
				entry: false,
				fileName: "src/foo.ts",
				text: `\
				class Foo {}
        export {Foo as F};
			`
			}
		],
		{
			typescript,
			rollup,
			debug: false
		}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		declare namespace Bar {
				class Foo {
				}
				export { Foo as F };
		}
		export { Bar };
		`)
	);
});

test.serial("Handles namespace exports. #6", {ts: ">=3.8"}, async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			...createExternalTestFiles(
				"my-library",
				`\
					export declare const foo = 2;
					export declare const bar = 3;
					export default 2;
				`
			),
			{
				entry: true,
				fileName: "src/index.ts",
				text: `\
        export * as Bar from "./foo";
			`
			},
			{
				entry: false,
				fileName: "src/foo.ts",
				text: `\
				export * from "my-library";
			`
			}
		],
		{
			typescript,
			rollup,
			debug: false
		}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		import { foo, bar } from "my-library";
		import { default as _default } from "my-library";
		declare namespace Bar {
				export { foo, bar, _default as default };
		}
		export { Bar };
		`)
	);
});

test.serial("Handles namespace exports. #7", {ts: ">=3.8"}, async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			...createExternalTestFiles(
				"my-library",
				`\
					export declare const foo = 2;
					export declare const bar = 3;
					export default 2;
				`
			),
			{
				entry: true,
				fileName: "src/index.ts",
				text: `\
        export {foo} from "./foo";
			`
			},
			{
				entry: false,
				fileName: "src/foo.ts",
				text: `\
				export * from "my-library";
			`
			}
		],
		{
			typescript,
			rollup,
			debug: false
		}
	);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		export { foo } from "my-library";
		`)
	);
});

test.serial("Handles namespace exports. #8", {ts: ">=3.8"}, async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "src/index.ts",
				text: `\
        export * as Foo from "./foo";
			`
			},
			{
				entry: false,
				fileName: "src/foo.ts",
				text: `\
				export {default} from "./bar";
			`
			},
			{
				entry: false,
				fileName: "src/bar.ts",
				text: `\
				export default 2;
			`
			}
		],
		{
			typescript,
			rollup,
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
				const _default: 2;
				export { _default as default };
		}
		export { Foo };
		`)
	);
});

test.serial("Handles namespace exports. #9", {ts: ">=3.8"}, async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			...createExternalTestFiles(
				"my-library",
				`\
					export declare const foo = 2;
					export declare const bar = 3;
					export default 2;
				`
			),
			{
				entry: true,
				fileName: "src/index.ts",
				text: `\
        export * as Foo from "./foo";
			`
			},
			{
				entry: false,
				fileName: "src/foo.ts",
				text: `\
				export {A as B} from "./bar";
			`
			},
			{
				entry: false,
				fileName: "src/bar.ts",
				text: `\
				export {foo as A} from "my-library";
			`
			}
		],
		{
			typescript,
			rollup,
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
				export { foo as B } from "my-library";
		}
		export { Foo };
		`)
	);
});
