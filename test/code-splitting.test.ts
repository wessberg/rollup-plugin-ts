import test from "ava";
import {formatCode} from "./util/format-code";
import {generateRollupBundle} from "./setup/setup-rollup";
import {stripKnownExtension} from "../src/util/path/path-util";
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
	const sharedFile = declarations.find(file => file.fileName.startsWith("shared-"));
	t.true(aFile != null);
	t.true(bFile != null);
	t.true(sharedFile != null);

	t.deepEqual(
		formatCode(aFile!.code),
		formatCode(`\
			import { Shared } from "./${stripKnownExtension(sharedFile!.fileName)}";
			declare class A extends Shared {
					a: string;
			}
			export {A};
		`)
	);

	t.deepEqual(
		formatCode(bFile!.code),
		formatCode(`\
			import { Shared } from "./${stripKnownExtension(sharedFile!.fileName)}";
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
	const loggerFile = declarations.find(file => file.fileName.startsWith("logger-"));
	t.true(aFile != null);
	t.true(bFile != null);
	t.true(loggerFile != null);

	t.deepEqual(
		formatCode(aFile!.code),
		formatCode(`\
			export { Logger } from "./${stripKnownExtension(loggerFile!.fileName)}";
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
