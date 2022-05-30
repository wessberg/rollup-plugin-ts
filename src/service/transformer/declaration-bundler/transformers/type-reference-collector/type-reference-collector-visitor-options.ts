import {TS} from "../../../../../type/ts.js";
import {SourceFileBundlerVisitorOptions} from "../source-file-bundler/source-file-bundler-visitor-options.js";
import {TypeReference} from "../../util/get-type-reference-module-from-file-name.js";

export interface TypeReferenceCollectorVisitorOptions<T extends TS.Node> extends SourceFileBundlerVisitorOptions {
	typescript: typeof TS;
	node: T;
	importDeclarations: TS.ImportDeclaration[];

	addTypeReference(typeReference: TypeReference): void;
	childContinuation<U extends TS.Node>(node: U): void;
	continuation<U extends TS.Node>(node: U): U | void;
}
