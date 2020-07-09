import * as TS321 from "typescript-3-2-1";
import * as TS331 from "typescript-3-3-1";
import * as TS341 from "typescript-3-4-1";
import * as TS351 from "typescript-3-5-1";
import * as TS362 from "typescript-3-6-2";
import * as TS372 from "typescript-3-7-2";
import * as TS383 from "typescript-3-8-3";
import * as TS392 from "typescript-3-9-2";
import * as TSCurrent from "typescript";
import avaTest, {ExecutionContext, ImplementationResult} from "ava";
import {TS} from "../../src/type/ts";

export interface ExtendedImplementationArgumentOptions {
	typescript: typeof TS;
	typescriptModuleSpecifier: string;
}

export type ExtendedImplementation<Context = unknown> = (t: ExecutionContext<Context>, options: ExtendedImplementationArgumentOptions) => ImplementationResult;

function sharedTest<Context = unknown>(title: string, implementation: ExtendedImplementation<Context>, subMethod?: "skip" | "only"): void {
	for (const [typescript, typescriptModuleSpecifier] of [
		[TS321, "typescript-3-2-1"],
		[TS331, "typescript-3-3-1"],
		[TS341, "typescript-3-4-1"],
		[TS351, "typescript-3-5-1"],
		[TS362, "typescript-3-6-2"],
		[TS372, "typescript-3-7-2"],
		[TS383, "typescript-3-8-3"],
		[TS392, "typescript-3-9-2"],
		[TSCurrent, "typescript"]
	] as [typeof TS, string][]) {
		const func = subMethod != null ? avaTest[subMethod] : avaTest.serial;
		func(`${title} (TypeScript v${typescript.version})`, ctx => implementation(ctx as ExecutionContext<Context>, {typescript, typescriptModuleSpecifier}));
	}
}

export default function test<Context = unknown>(title: string, implementation: ExtendedImplementation<Context>): void {
	return sharedTest(title, implementation);
}

test.only = <Context = unknown>(title: string, implementation: ExtendedImplementation<Context>): void => {
	return sharedTest(title, implementation, "only");
};

test.skip = <Context = unknown>(title: string, implementation: ExtendedImplementation<Context>): void => {
	return sharedTest(title, implementation, "skip");
};
