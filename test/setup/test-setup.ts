/* eslint-disable @typescript-eslint/naming-convention */
import {createTestContext, TestContext} from "./test-context";
import {createTestFileStructure, TestFile, TestFileStructure} from "./test-file";
import {createVirtualFileSystem} from "./create-virtual-file-system";
import {MaybeArray, PartialExcept} from "helpertypes";
import {TS} from "../../src/type/ts";
import {createTypeScriptSystem} from "../util/create-typescript-system";

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
