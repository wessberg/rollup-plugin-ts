import path from "crosspath";
import fs from "fs";
import {TestContext} from "./test-context";
import {MaybeArray} from "helpertypes";
import {ensureArray} from "../../src/util/ensure-array/ensure-array";
import {generateRandomPath} from "../../src/util/hash/generate-random-hash";
import {CachedFs} from "../../src/service/cache/cached-fs";
import {stripNodePrefixFromModuleSpecifier} from "../../src/util/path/path-util";

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

export interface CreateExternalTestFilesOptions {
	fileName: string;
}

export function createExternalTestFiles(module: string, text: string, {fileName = "index.d.ts"}: Partial<CreateExternalTestFilesOptions> = {}): TestFile[] {
	return [
		{
			entry: false,
			fileName: `node_modules/${module}/package.json`,
			text: `
				{
					"name": "${module}",
					"version": "1.0.0",
					"types": "${fileName}"
				}
			`
		},
		{
			entry: false,
			fileName: `node_modules/${module}/${fileName}`,
			text
		}
	];
}

export type SupportedBuiltInModuleBase = "fs" | "globals" | "buffer" | "dns";
export type SuppportedBuiltInModule = SupportedBuiltInModuleBase | `node:${SupportedBuiltInModuleBase}`;
export function createBuiltInModuleTestFiles(...modules: SuppportedBuiltInModule[]): TestFile[] {
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
		...modules.flatMap(module => [
			{
				entry: false,
				fileName: "node_modules/@types/node/index.d.ts",
				text: `
					/// <reference path="./${stripNodePrefixFromModuleSpecifier(module)}.d.ts" />
					`
			},
			{
				entry: false,
				fileName: `node_modules/@types/node/${stripNodePrefixFromModuleSpecifier(module)}.d.ts`,
				text: fsWorker.readFile(path.native.join(nodeTypesDir, `${stripNodePrefixFromModuleSpecifier(module)}.d.ts`)) ?? ""
			}
		])
	];
}

export function createTestFileStructure(input: MaybeArray<TestFile>, context: TestContext): TestFileStructure {
	const tsModuleNames = [`typescript-${context.typescript.version.replace(/\./g, "-")}`, "typescript"];
	let tsLibsDir: string | undefined;
	let swcHelperDir: string | undefined;
	let babelRuntimeDir: string | undefined;

	for (const tsModuleName of tsModuleNames) {
		try {
			tsLibsDir = path.join(path.dirname(require.resolve(`${tsModuleName}/package.json`)), "lib");
			break;
		} catch (ex) {
			// Noop
		}
	}
	if (tsLibsDir == null) {
		throw new ReferenceError(`No TypeScript directory could be resolved inside node_modules`);
	}

	if (context.loadSwcHelpers) {
		try {
			swcHelperDir = path.dirname(require.resolve("@swc/helpers/package.json"));
		} catch (ex) {
			throw new ReferenceError(`No @swc/helpers directory could be resolved inside node_modules`);
		}
	}

	if (context.loadBabelHelpers) {
		try {
			babelRuntimeDir = path.dirname(require.resolve("@babel/runtime/package.json"));
		} catch (ex) {
			throw new ReferenceError(`No @babel/runtime directory could be resolved inside node_modules`);
		}
	}

	const builtInLibs = fs.readdirSync(tsLibsDir).filter(file => file.startsWith("lib.") && file.endsWith(".d.ts"));

	const swcHelperFiles =
		context.loadSwcHelpers && swcHelperDir != null ? ["package.json", ...fs.readdirSync(path.join(swcHelperDir, "lib")).map(file => path.join("lib", file))] : [];
	const babelRuntimeHelperFiles =
		context.loadBabelHelpers && babelRuntimeDir != null
			? [
					"package.json",
					...fs
						.readdirSync(path.join(babelRuntimeDir, "helpers"))
						.filter(file => file !== "esm")
						.map(file => path.join("helpers", file)),
					...fs.readdirSync(path.join(babelRuntimeDir, "helpers/esm")).map(file => path.join("helpers/esm", file))
			  ]
			: [];

	const DEFAULT_FILES: TestFileRecord[] = [
		{
			fileName: "tslib.d.ts",
			text: fsWorker.readFile(path.native.join(tslibDir, "tslib.d.ts")) ?? "",
			internal: true
		},
		...builtInLibs.map(lib => ({
			fileName: path.join(tsLibsDir!, lib),
			text: fsWorker.readFile(path.native.join(tsLibsDir!, lib)) ?? "",
			internal: true
		})),
		...swcHelperFiles.map(file => ({
			fileName: path.join(`node_modules/@swc/helpers`, file),
			text: fsWorker.readFile(path.native.join(swcHelperDir!, file)) ?? "",
			internal: true
		})),
		...babelRuntimeHelperFiles.map(file => ({
			fileName: path.join(`node_modules/@babel/runtime`, file),
			text: fsWorker.readFile(path.native.join(babelRuntimeDir!, file)) ?? "",
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
