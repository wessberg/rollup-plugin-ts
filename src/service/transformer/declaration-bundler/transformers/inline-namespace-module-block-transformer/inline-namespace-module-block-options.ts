import type {TS} from "../../../../../type/ts.js";

export interface InlineNamespaceModuleBlockOptions {
	intentToAddImportDeclaration(importDeclaration: TS.ImportDeclaration): void;
	intentToAddModuleDeclaration(moduleDeclaration: TS.ModuleDeclaration): void;
}
