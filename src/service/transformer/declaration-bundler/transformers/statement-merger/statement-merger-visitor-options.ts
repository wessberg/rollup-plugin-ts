import type {TS} from "../../../../../type/ts.js";
import type {SourceFileBundlerVisitorOptions} from "../source-file-bundler/source-file-bundler-visitor-options.js";

export interface StatementMergerVisitorOptions<T extends TS.Node> extends SourceFileBundlerVisitorOptions {
	typescript: typeof TS;
	node: T;

	preserveImportedModuleIfNeeded(module: string): TS.ImportDeclaration[] | undefined;
	preserveExportedModuleIfNeeded(module: string | undefined, typeOnly: boolean): TS.ExportDeclaration[] | undefined;
	childContinuation<U extends TS.Node>(node: U): U | undefined;
	continuation<U extends TS.Node>(node: U): U | undefined;
}
