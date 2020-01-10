import {TS} from "../../../../../type/ts";
import {SourceFileBundlerVisitorOptions} from "../source-file-bundler/source-file-bundler-visitor-options";

export interface TreeShakerVisitorOptions<T extends TS.Node> extends SourceFileBundlerVisitorOptions {
	typescript: typeof TS;
	node: T;
	sourceFile: TS.SourceFile;
	continuation<U extends TS.Node>(node: U): U | undefined;
	isReferenced(node: TS.Node): boolean;
}
