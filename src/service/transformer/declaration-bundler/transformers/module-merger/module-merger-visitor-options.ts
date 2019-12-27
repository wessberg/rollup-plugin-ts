import {TS} from "../../../../../type/ts";
import {DeclarationTransformer} from "../../declaration-bundler-options";
import {LexicalEnvironment} from "../deconflicter/deconflicter-options";
import {NodePlacementQueue} from "../../util/get-node-placement-queue";
import {ImportedSymbol} from "../../../cross-chunk-reference-tracker/transformers/track-imports-transformer/track-imports-transformer-visitor-options";
import {SourceFileBundlerVisitorOptions} from "../source-file-bundler/source-file-bundler-visitor-options";

export type PayloadMap = {
	[Key in TS.SyntaxKind]: Key extends
		| TS.SyntaxKind.ImportType
		| TS.SyntaxKind.ImportDeclaration
		| TS.SyntaxKind.ImportClause
		| TS.SyntaxKind.NamedImports
		| TS.SyntaxKind.NamedExports
		| TS.SyntaxKind.ExportDeclaration
		? {
				moduleSpecifier: string | undefined;
				matchingSourceFile: TS.SourceFile | undefined;
		  }
		: undefined;
};

export type VisitResult<T extends TS.Node> = T extends TS.ImportTypeNode
	? TS.Identifier | TS.TypeQueryNode | TS.ImportTypeNode | TS.QualifiedName
	: T extends TS.ImportDeclaration | TS.ImportSpecifier | TS.ExportSpecifier | TS.ImportClause | TS.NamespaceImport
	? T | undefined
	: T extends TS.ExportDeclaration
	? TS.ExportDeclaration[] | TS.ExportDeclaration
	: T;

export type ChildVisitResult<T extends TS.Node> = T;

export interface IncludeSourceFileOptions {
	allowDuplicate: boolean;
	allowExports: boolean;
	lexicalEnvironment: LexicalEnvironment;
	transformers: DeclarationTransformer[];
}

export interface ModuleMergerVisitorOptions<T extends TS.Node> extends SourceFileBundlerVisitorOptions, NodePlacementQueue {
	transformers: DeclarationTransformer[];
	node: T;
	payload: PayloadMap[T["parent"]["kind"]];
	continuation<U extends TS.Node>(node: U, payload: PayloadMap[U["kind"]]): VisitResult<U>;
	childContinuation<U extends TS.Node>(node: U, payload: PayloadMap[U["kind"]]): ChildVisitResult<U>;

	getMatchingSourceFile(moduleSpecifier: string, from: TS.SourceFile): TS.SourceFile | undefined;
	shouldPreserveImportedSymbol(importedSymbol: ImportedSymbol): boolean;
	includeSourceFile(sourceFile: TS.SourceFile, options?: Partial<IncludeSourceFileOptions>): Iterable<TS.Statement>;
	prependNodes(...nodes: TS.Node[]): void;
}
