import test from "ava";
import {formatCode} from "./util/format-code";
import {generateRollupBundle} from "./setup/setup-rollup";
// tslint:disable:no-duplicate-string

test("Declaration bundling supports code splitting. #1", async t => {
	const bundle = await generateRollupBundle([
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
	]);
	const {declarations} = bundle;

	const aFile = declarations.find(file => file.fileName.includes("a.d.ts"));
	const bFile = declarations.find(file => file.fileName.includes("b.d.ts"));
	const sharedFile = declarations.find(file => file.fileName.includes("shared-be8cec94.d.ts"));
	t.true(aFile != null);
	t.true(bFile != null);
	t.true(sharedFile != null);

	t.deepEqual(
		formatCode(aFile!.code),
		formatCode(`\
			import { Shared } from "./shared-be8cec94";
			declare class A extends Shared {
					a: string;
			}
			export {A};
		`)
	);

	t.deepEqual(
		formatCode(bFile!.code),
		formatCode(`\
			import { Shared } from "./shared-be8cec94";
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

test("Declaration bundling supports code splitting. #2", async t => {
	const bundle = await generateRollupBundle([
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
	]);
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

test("Declaration bundling supports code splitting. #3", async t => {
	const bundle = await generateRollupBundle(
		[
			{
				entry: true,
				fileName: "a.ts",
				text: `\
					import "./b";
					`
			},
			{
				entry: false,
				fileName: "b.ts",
				text: `\
					(async () => {
						const {foo} = await import("./c");
					})();
					`
			},
			{
				entry: false,
				fileName: "c.ts",
				text: `\
				import {BarOptions} from "./d";

				export function foo (): BarOptions {
					return {};
				}
					`
			},
			{
				entry: false,
				fileName: "d.ts",
				text: `\	
			import {BazOptions} from "./e";

			export interface BarOptions extends BazOptions {
			}
					`
			},
			{
				entry: false,
				fileName: "e.ts",
				text: `\	
			export interface BazOptions {
			}
				`
			}
		],
		{debug: true}
	);
	const {declarations} = bundle;
	for (const _declaration of declarations) {
	}
	t.true(true);
});
