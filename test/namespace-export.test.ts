import test from "ava";
import {withTypeScript, withTypeScriptVersions} from "./util/ts-macro";
import {formatCode} from "./util/format-code";
import {generateRollupBundle} from "./setup/setup-rollup";

test.serial("Handles namespace exports. #1", withTypeScript, async (t, {typescript}) => {
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

test.serial("Handles namespace exports. #2", withTypeScriptVersions(">=3.8"), async (t, {typescript}) => {
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

test.serial("Handles namespace exports. #3", withTypeScriptVersions(">=3.8"), async (t, {typescript}) => {
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

test.serial("Handles namespace exports. #4", withTypeScriptVersions(">=3.8"), async (t, {typescript}) => {

	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "virtual-src/index.ts",
				text: `\
          		export * as Foo from "./foo";
          		export * as Bar from "./bar";
        	`
			},
			{
				entry: false,
				fileName: "virtual-src/foo.ts",
				text: `\
				import { Subscribable } from 'ava';

				export interface Foo extends Subscribable {
					a: number
				}
				`
			},
			{
				entry: false,
				fileName: "virtual-src/bar.ts",
				text: `\
				import { Subscribable } from 'ava';

				export interface Bar extends Subscribable {
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
			import { Subscribable } from "ava";
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

test.serial("Handles namespace exports. #5", withTypeScriptVersions(">=3.8"), async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "virtual-src/index.ts",
				text: `\
        export * as Bar from "./foo";
			`
			},
			{
				entry: false,
				fileName: "virtual-src/foo.ts",
				text: `\
				class Foo {}
        export {Foo as F};
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
		declare namespace Bar {
				class Foo {
				}
				export { Foo as F };
		}
		export { Bar };
		`)
	);
});

test.serial("Handles namespace exports. #6", withTypeScriptVersions(">=3.8"), async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "virtual-src/index.ts",
				text: `\
        export * as Bar from "./foo";
			`
			},
			{
				entry: false,
				fileName: "virtual-src/foo.ts",
				text: `\
				export * from "@wessberg/stringutil";
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
		import { unquote, isInCamelCase, isInPascalCase, isInKebabCase, isLowerCase, isUpperCase, lowerCaseFirst, upperCaseFirst, isEmpty, startsWithQuote, endsWithQuote, isQuoted, allIndexesOf, matchAll, trimAll, camelCase, pascalCase, capitalize, kebabCase, removeWhitespace, containsWhitespace, containsOnlyWhitespace, trim, convertToAscii, truncate, ITruncateOptions } from "@wessberg/stringutil";
		declare namespace Bar {
				export { unquote, isInCamelCase, isInPascalCase, isInKebabCase, isLowerCase, isUpperCase, lowerCaseFirst, upperCaseFirst, isEmpty, startsWithQuote, endsWithQuote, isQuoted, allIndexesOf, matchAll, trimAll, camelCase, pascalCase, capitalize, kebabCase, removeWhitespace, containsWhitespace, containsOnlyWhitespace, trim, convertToAscii, truncate, ITruncateOptions };
		}
		export { Bar };
		`)
	);
});

test.serial("Handles namespace exports. #7", withTypeScriptVersions(">=3.8"), async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "virtual-src/index.ts",
				text: `\
        export {unquote} from "./foo";
			`
			},
			{
				entry: false,
				fileName: "virtual-src/foo.ts",
				text: `\
				export * from "@wessberg/stringutil";
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
		export { unquote } from "@wessberg/stringutil";
		`)
	);
});

test.serial("Handles namespace exports. #8", withTypeScriptVersions(">=3.8"), async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "virtual-src/index.ts",
				text: `\
        export * as Foo from "./foo";
			`
			},
			{
				entry: false,
				fileName: "virtual-src/foo.ts",
				text: `\
				export {default} from "./bar";
			`
			},
			{
				entry: false,
				fileName: "virtual-src/bar.ts",
				text: `\
				export default 2;
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
				const _default: 2;
				export { _default as default };
		}
		export { Foo };
		`)
	);
});

test.serial("Handles namespace exports. #9", withTypeScriptVersions(">=3.8"), async (t, {typescript}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "virtual-src/index.ts",
				text: `\
        export * as Foo from "./foo";
			`
			},
			{
				entry: false,
				fileName: "virtual-src/foo.ts",
				text: `\
				export {A as B} from "./bar";
			`
			},
			{
				entry: false,
				fileName: "virtual-src/bar.ts",
				text: `\
				export {unquote as A} from "@wessberg/stringutil";
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
				export { unquote as B } from "@wessberg/stringutil";
		}
		export { Foo };
		`)
	);
});