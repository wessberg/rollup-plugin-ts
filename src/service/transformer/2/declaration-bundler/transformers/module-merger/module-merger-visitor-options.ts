import {SourceFileBundlerVisitorOptions} from "../source-file-bundler/source-file-bundler-visitor-options";
import {TS} from "../../../../../../type/ts";
import {DeclarationTransformer} from "../../declaration-bundler-options";
import {LexicalEnvironment} from "../deconflicter/deconflicter-options";

export type PayloadMap = {
	[Key in TS.SyntaxKind]: Key extends TS.SyntaxKind.ImportType | TS.SyntaxKind.ExportDeclaration
		? {
				moduleSpecifier: string | undefined;
		  }
		: undefined;
};

export type VisitResult<T extends TS.Node> = T extends TS.ImportTypeNode
	? TS.Identifier | TS.TypeQueryNode | TS.ImportTypeNode | TS.QualifiedName
	: T;

export type ChildVisitResult<T extends TS.Node> = T;

export interface IncludeSourceFileOptions {
	allowDuplicate: boolean;
	lexicalEnvironment: LexicalEnvironment;
}

export interface ModuleMergerVisitorOptions<T extends TS.Node> extends SourceFileBundlerVisitorOptions {
	transformers: DeclarationTransformer[];
	node: T;
	payload: PayloadMap[T["parent"]["kind"]];
	continuation<U extends TS.Node>(node: U, payload: PayloadMap[U["kind"]]): VisitResult<U>;
	childContinuation<U extends TS.Node>(node: U, payload: PayloadMap[U["kind"]]): ChildVisitResult<U>;

	getMatchingSourceFile(moduleSpecifier: string, from: string): TS.SourceFile | undefined;
	includeSourceFile(sourceFile: TS.SourceFile, options?: Partial<IncludeSourceFileOptions>): Iterable<TS.Statement>;
	prependNodes(...nodes: TS.Node[]): void;
}
