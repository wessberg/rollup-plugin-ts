import type {TS} from "../../../../../type/ts.js";
import type {CompilerHost} from "../../../../compiler-host/compiler-host.js";
import type {ModuleDependency} from "../../../../../util/get-module-dependencies/get-module-dependencies.js";

export interface TrackDependenciesOptions {
	host: CompilerHost;
	sourceFile: TS.SourceFile;
}

export interface TrackDependenciesTransformerVisitorOptions<T extends TS.Node> extends TrackDependenciesOptions {
	node: T;
	shouldDeepTraverse: boolean;
	typescript: typeof TS;

	childContinuation<U extends TS.Node>(node: U): void;
	continuation<U extends TS.Node>(node: U): void;
	addDependency(module: ModuleDependency): void;
}
