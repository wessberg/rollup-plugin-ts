import {TS} from "../../../../../type/ts";
import {SourceFileBundlerVisitorOptions} from "../source-file-bundler/source-file-bundler-visitor-options";

export interface TypeReferenceCollectorVisitorOptions<T extends TS.Node> extends SourceFileBundlerVisitorOptions {
	typescript: typeof TS;
	node: T;
	importDeclarations: TS.ImportDeclaration[];

	addTypeReference(module: string): void;
	childContinuation<U extends TS.Node>(node: U): void;
	continuation<U extends TS.Node>(node: U): U | void;
}
