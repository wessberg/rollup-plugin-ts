import test from "ava";
import {formatCode} from "./util/format-code";
import {generateRollupBundle} from "./setup/setup-rollup";
// tslint:disable:no-duplicate-string

test("Tree-shakes correctly. #1", async t => {
	const bundle = await generateRollupBundle([
		{
			entry: true,
			fileName: "index.ts",
			text: `\
					import {SyntaxKind, EmitHint} from "typescript";
					export type Baz = SyntaxKind;
					`
		}
	]);
	const {
		declarations: [file]
	} = bundle;
	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		import {SyntaxKind} from "typescript";
		declare type Baz = SyntaxKind;
		export {Baz};
		`)
	);
});

test("Tree-shakes correctly. #2", async t => {
	const bundle = await generateRollupBundle([
		{
			entry: true,
			fileName: "index.ts",
			text: `\
					export {bar} from "./foo";
					`
		},
		{
			entry: false,
			fileName: "foo.ts",
			text: `\
					export const foo = 2;
					export const bar = 3;
					`
		}
	]);
	const {
		declarations: [file]
	} = bundle;
	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
		declare const bar = 3;
		export {bar};
		`)
	);
});

test("Tree-shakes correctly. #3", async t => {
	const bundle = await generateRollupBundle([
		{
			entry: true,
			fileName: "index.ts",
			text: `\
					export {Foo} from "./foo";
					`
		},
		{
			entry: false,
			fileName: "foo.ts",
			text: `\
					import {Bar} from "./bar";
					export interface Foo {
						bar: Bar;
					}
					`
		},
		{
			entry: false,
			fileName: "bar.ts",
			text: `\
					import {Foo} from "./foo";
					export class Bar {
						bar: Foo;
					}
					`
		}
	]);
	const {
		declarations: [file]
	} = bundle;

	t.deepEqual(
		formatCode(file.code),
		formatCode(`\
			declare class Bar {
				bar: Foo;
			}
			interface Foo {
				bar: Bar;
			}
			export { Foo };
		`)
	);
});

test("Tree-shakes correctly. #4", async t => {
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
		]
	);
	const {declarations} = bundle;

	const aFile = declarations.find(file => file.fileName.includes("a.d.ts"));
	const bFile = declarations.find(file => file.fileName.includes("b.d.ts"));
	const loggerFile = declarations.find(file => file.fileName.includes("logger-8396bc98"));
	t.true(aFile != null);
	t.true(bFile != null);
	t.true(loggerFile != null);

	t.deepEqual(
		formatCode(aFile!.code),
		formatCode(`\
			export { Logger } from "./logger-8396bc98";
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
