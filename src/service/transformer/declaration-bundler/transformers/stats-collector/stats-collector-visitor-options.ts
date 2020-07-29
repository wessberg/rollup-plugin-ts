import {TS} from "../../../../../type/ts";
import {SourceFileBundlerVisitorOptions} from "../source-file-bundler/source-file-bundler-visitor-options";

export interface StatsCollectorVisitorOptions<T extends TS.Node> extends SourceFileBundlerVisitorOptions {
	typescript: typeof TS;
	node: T;

	trackImport(moduleSpecifier: string): void;
	childContinuation<U extends TS.Node>(node: U): void;
	continuation<U extends TS.Node>(node: U): U | void;
}
