import {TS} from "../../../../../type/ts";

export interface InlineNamespaceModuleBlockOptions {
	intentToAddImportDeclaration(importDeclaration: TS.ImportDeclaration): void;
	intentToAddModuleDeclaration(moduleDeclaration: TS.ModuleDeclaration): void;
}
