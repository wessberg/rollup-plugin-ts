import {TS} from "../../../../../type/ts";
import {SourceFileBundlerVisitorOptions} from "../source-file-bundler/source-file-bundler-visitor-options";

export interface StatementMergerVisitorOptions<T extends TS.Node> extends SourceFileBundlerVisitorOptions {
	typescript: typeof TS;
	node: T;

	preserveImportedModuleIfNeeded(module: string): TS.ImportDeclaration[] | undefined;
	preserveExportedModuleIfNeeded(module: string | undefined): TS.ExportDeclaration[] | undefined;
	childContinuation<U extends TS.Node>(node: U): U | undefined;
	continuation<U extends TS.Node>(node: U): U | undefined;
}
