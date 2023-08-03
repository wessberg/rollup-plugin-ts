import {test} from "./util/test-runner.js";
import {formatCode} from "./util/format-code.js";
import {generateRollupBundle} from "./setup/setup-rollup.js";
import {stripKnownExtension} from "../src/util/path/path-util.js";

test.serial("Declaration bundling supports code splitting. #1", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "a.ts",
				text: `\
				import {Shared} from "./shared";

				export class A extends Shared {
					a: string;
				}
				`
			},
			{
				entry: true,
				fileName: "b.ts",
				text: `\
				import {Shared} from "./shared";

				export class B extends Shared {
					b: string;
				}
				`
			},
			{
				entry: false,
				fileName: "shared.ts",
				text: `\
							export class Shared {
								shared: string;
							}
        	`
			}
		],
		{typescript, rollup, debug: false}
	);
	const {declarations} = bundle;

	const aFile = declarations.find(file => file.fileName.includes("a.d.ts"));
	const bFile = declarations.find(file => file.fileName.includes("b.d.ts"));
	const sharedFile = declarations.find(file => file.fileName.startsWith("shared-"));
	t.true(aFile != null);
	t.true(bFile != null);
	t.true(sharedFile != null);

	t.deepEqual(
		formatCode(aFile!.code),
		formatCode(`\
			import { Shared } from "./${stripKnownExtension(sharedFile!.fileName)}.js";
			declare class A extends Shared {
					a: string;
			}
			export {A};
		`)
	);

	t.deepEqual(
		formatCode(bFile!.code),
		formatCode(`\
			import { Shared } from "./${stripKnownExtension(sharedFile!.fileName)}.js";
			declare class B extends Shared {
					b: string;
			}
			export {B};
		`)
	);

	t.deepEqual(
		formatCode(sharedFile!.code),
		formatCode(`\
			declare class Shared {
				shared: string;
			}
			export {Shared};
		`)
	);
});

test.serial("Declaration bundling supports code splitting. #2", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "a.ts",
				text: `\
					export {Logger} from "./logger";
					`
			},
			{
				entry: true,
				fileName: "b.ts",
				text: `\
					import {Logger} from "./logger";
					console.log(Logger);
					`
			},
			{
				entry: false,
				fileName: "logger.ts",
				text: `\
					import {LogLevel} from "./log-level";

					export class Logger {
						constructor (private level: LogLevel) {
						}
					}
					`
			},
			{
				entry: false,
				fileName: "log-level.ts",
				text: `\
					export enum LogLevel {}
					`
			}
		],
		{typescript, rollup, debug: false}
	);
	const {declarations} = bundle;

	const aFile = declarations.find(file => file.fileName.includes("a.d.ts"));
	const bFile = declarations.find(file => file.fileName.includes("b.d.ts"));
	const loggerFile = declarations.find(file => file.fileName.startsWith("logger-"));
	t.true(aFile != null);
	t.true(bFile != null);
	t.true(loggerFile != null);

	t.deepEqual(
		formatCode(aFile!.code),
		formatCode(`\
			export { Logger } from "./${stripKnownExtension(loggerFile!.fileName)}.js";
		`)
	);

	t.deepEqual(
		formatCode(bFile!.code),
		formatCode(`\
			export {};
		`)
	);

	t.deepEqual(
		formatCode(loggerFile!.code),
		formatCode(`\
			declare enum LogLevel {
			}
			declare class Logger {
					private level;
					constructor(level: LogLevel);
			}
			export { LogLevel, Logger };
		`)
	);
});

test.serial("Declaration bundling supports code splitting. #3", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "a.ts",
				text: `\
				import Shared from "./shared";
        export class Foo extends Shared {}
        export {default as Shared} from "./shared";
        export * from "./shared";
			`
			},
			{
				entry: true,
				fileName: "b.ts",
				text: `\
				import Shared from "./shared";
        export class Bar extends Shared {}
			`
			},
			{
				entry: false,
				fileName: "shared.ts",
				text: `\
				export default class Foo {}
			`
			}
		],
		{typescript, rollup, debug: false}
	);
	const {declarations} = bundle;

	const aFile = declarations.find(file => file.fileName.includes("a.d.ts"));
	const bFile = declarations.find(file => file.fileName.includes("b.d.ts"));
	const sharedFile = declarations.find(file => file.fileName.startsWith("shared-"));
	t.true(aFile != null);
	t.true(bFile != null);
	t.true(sharedFile != null);

	t.deepEqual(
		formatCode(aFile!.code),
		formatCode(`\
			import Shared from "./${stripKnownExtension(sharedFile!.fileName)}.js";
			declare class Foo extends Shared {
			}
			export { Foo };
			export * from "./${stripKnownExtension(sharedFile!.fileName)}.js";
			export { default as Shared } from "./${stripKnownExtension(sharedFile!.fileName)}.js";
		`)
	);

	t.deepEqual(
		formatCode(bFile!.code),
		formatCode(`\
			import Shared from "./${stripKnownExtension(sharedFile!.fileName)}.js";
			declare class Bar extends Shared {
			}
			export { Bar };
		`)
	);

	t.deepEqual(
		formatCode(sharedFile!.code),
		formatCode(`\
			declare class Foo {
			}
			export { Foo as default };
		`)
	);
});

test.serial("Declaration bundling supports code splitting. #4", "*", async (t, {typescript, rollup}) => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "src/api.ts",
				text: `\
				export {Foo} from "./foo";
			`
			},
			{
				entry: true,
				fileName: "src/cli/cli.ts",
				text: `\
				import "../foo";
				console.log(true);
			`
			},
			{
				entry: false,
				fileName: "src/foo.ts",
				text: `\
				export type Foo = string;
			`
			}
		],
		{typescript, rollup, debug: false}
	);

	const {declarations} = bundle;

	const apiFile = declarations.find(file => file.fileName.includes("api.d.ts"));
	const cliFile = declarations.find(file => file.fileName.includes("cli.d.ts"));
	const fooFile = declarations.find(file => file.fileName.startsWith("foo-"));

	t.true(apiFile != null);
	t.true(cliFile != null);
	t.true(fooFile != null);

	t.deepEqual(
		formatCode(apiFile!.code),
		formatCode(`\
			export { Foo } from "./${stripKnownExtension(fooFile!.fileName)}.js";
		`)
	);

	t.deepEqual(
		formatCode(cliFile!.code),
		formatCode(`\
			export {};
		`)
	);

	t.deepEqual(
		formatCode(fooFile!.code),
		formatCode(`\
			type Foo = string;
			export {Foo};
		`)
	);
});
