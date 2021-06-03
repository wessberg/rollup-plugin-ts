import path from "crosspath";
import fs from "fs";
import {TestContext} from "./test-context";
import {MaybeArray} from "helpertypes";
import {ensureArray} from "../../src/util/ensure-array/ensure-array";
import {generateRandomPath} from "../../src/util/hash/generate-random-hash";
import {CachedFs} from "../../src/service/cache/cached-fs";

export interface TestFileRecord {
	fileName: string;
	text: string;
	entry?: boolean;
	internal?: boolean;
}

export type TestFile = TestFileRecord | string;

export interface TestFileStructure {
	files: TestFileRecord[];
	entries: TestFileRecord[];
	userFiles: TestFileRecord[];
}

const fsWorker = new CachedFs({fs});
const tslibDir = path.dirname(require.resolve("tslib"));
const nodeTypesDir = path.dirname(require.resolve("@types/node/package.json"));

export function createExternalTestFiles(module: string, text: string): TestFile[] {
	return [
		{
			entry: false,
			fileName: `node_modules/${module}/package.json`,
			text: `
				{
					"name": "${module}",
					"version": "1.0.0",
					"types": "index.d.ts"
				}
			`
		},
		{
			entry: false,
			fileName: `node_modules/${module}/index.d.ts`,
			text
		}
	];
}

export function createBuiltInModuleTestFiles(module: "fs" | "globals"): TestFile[] {
	return [
		{
			entry: false,
			fileName: "node_modules/@types/node/package.json",
			text: `
				{
					"name": "@types/node",
					"version": "1.0.0",
					"types": "index.d.ts"
				}
			`
		},
		{
			entry: false,
			fileName: "node_modules/@types/node/index.d.ts",
			text: `
				/// <reference path="./${module}.d.ts" />
				`
		},
		{
			entry: false,
			fileName: `node_modules/@types/node/${module}.d.ts`,
			text: fsWorker.readFile(path.native.join(nodeTypesDir, `${module}.d.ts`)) ?? ""
		}
	];
}

export function createTestFileStructure(input: MaybeArray<TestFile>, context: TestContext): TestFileStructure {
	const tsModuleNames = [`typescript-${context.typescript.version.replace(/\./g, "-")}`, "typescript"];
	let tsDir: string | undefined;
	for (const tsModuleName of tsModuleNames) {
		try {
			tsDir = path.dirname(require.resolve(tsModuleName));
			break;
		} catch (ex) {}
	}
	if (tsDir == null) {
		throw new ReferenceError(`No TypeScript directory could be resolved inside node_modules`);
	}
	const builtInLibs = fs.readdirSync(tsDir).filter(file => file.startsWith("lib.") && file.endsWith(".d.ts"));

	const DEFAULT_FILES: TestFileRecord[] = [
		{
			fileName: "tslib.d.ts",
			text: fsWorker.readFile(path.native.join(tslibDir, "tslib.d.ts")) ?? "",
			internal: true
		},
		...builtInLibs.map(lib => ({
			fileName: path.join(tsDir!, lib),
			text: fsWorker.readFile(path.native.join(tsDir!, lib)) ?? "",
			internal: true
		}))
	];

	const files: TestFileRecord[] = [...DEFAULT_FILES, ...ensureArray(input)]
		.map(file =>
			typeof file === "string"
				? {
						text: file,
						fileName: generateRandomPath({extension: ".ts"}),
						entry: true
				  }
				: file
		)
		.map(file => ({...file, fileName: path.isAbsolute(file.fileName) ? file.fileName : path.join(context.cwd, file.fileName)}));

	const entries = files.filter(file => file.entry);
	const userFiles = files.filter(file => !(file.internal ?? false));

	return {
		files,
		entries,
		userFiles
	};
}
