/* eslint-disable @typescript-eslint/naming-convention */
import type {TestContext} from "./test-context.js";
import {createTestContext} from "./test-context.js";
import type {TestFile, TestFileStructure} from "./test-file.js";
import {createTestFileStructure} from "./test-file.js";
import {createVirtualFileSystem} from "./create-virtual-file-system.js";
import type {MaybeArray, PartialExcept} from "helpertypes";
import type {TS} from "../../src/type/ts.js";
import {createTypeScriptSystem} from "../util/create-typescript-system.js";

export interface TestSetup {
	context: TestContext;
	fileSystem: TS.System;
	fileStructure: TestFileStructure;
}

export function createTestSetup(inputFiles: MaybeArray<TestFile>, options: PartialExcept<TestContext, "typescript">): TestSetup {
	const context = createTestContext(options);
	const fileStructure = createTestFileStructure(inputFiles, context);
	const fileSystem = createVirtualFileSystem(fileStructure.files);

	const {typescript, cwd} = context;

	return {
		context,
		fileStructure,
		fileSystem: createTypeScriptSystem({typescript, cwd, fs: fileSystem})
	};
}
