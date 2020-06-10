import {TS} from "../../../../../type/ts";
import {ExtendedResolvedModule} from "../../../../cache/resolve-cache/extended-resolved-module";
import {CompilerHost} from "../../../../compiler-host/compiler-host";

export interface TrackDependenciesOptions {
	host: CompilerHost;
	typescript: typeof TS;
	sourceFile: TS.SourceFile;
}

export interface TrackDependenciesTransformerVisitorOptions<T extends TS.Node> extends TrackDependenciesOptions {
	node: T;
	shouldDeepTraverse: boolean;

	childContinuation<U extends TS.Node>(node: U): void;
	continuation<U extends TS.Node>(node: U): void;
	addDependency(module: ExtendedResolvedModule): void;
}
