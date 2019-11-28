import {ContinuationOptions, DeconflicterVisitorOptions} from "./deconflicter-visitor-options";
import {deconflictIdentifier} from "./visitor/deconflict/deconflict-identifier";
import {normalize} from "path";
import {deconflictBindingElement} from "./visitor/deconflict/deconflict-binding-element";
import {deconflictImportSpecifier} from "./visitor/deconflict/deconflict-import-specifier";
import {deconflictPropertySignature} from "./visitor/deconflict/deconflict-property-signature";
import {deconflictMethodSignature} from "./visitor/deconflict/deconflict-method-signature";
import {deconflictMethodDeclaration} from "./visitor/deconflict/deconflict-method-declaration";
import {deconflictPropertyDeclaration} from "./visitor/deconflict/deconflict-property-declaration";
import {deconflictParameterDeclaration} from "./visitor/deconflict/deconflict-parameter-declaration";
import {deconflictExportSpecifier} from "./visitor/deconflict/deconflict-export-specifier";
import {deconflictPropertyAssignment} from "./visitor/deconflict/deconflict-property-assignment";
import {deconflictGetAccessorDeclaration} from "./visitor/deconflict/deconflict-get-accessor-declaration";
import {deconflictSetAccessorDeclaration} from "./visitor/deconflict/deconflict-set-accessor-declaration";
import {deconflictMappedTypeNode} from "./visitor/deconflict/deconflict-mapped-type-node";
import {deconflictClassDeclaration} from "./visitor/deconflict/deconflict-class-declaration";
import {deconflictEnumDeclaration} from "./visitor/deconflict/deconflict-enum-declaration";
import {deconflictClassExpression} from "./visitor/deconflict/deconflict-class-expression";
import {deconflictEnumMember} from "./visitor/deconflict/deconflict-enum-member";
import {deconflictFunctionDeclaration} from "./visitor/deconflict/deconflict-function-declaration";
import {deconflictFunctionExpression} from "./visitor/deconflict/deconflict-function-expression";
import {deconflictImportClause} from "./visitor/deconflict/deconflict-import-clause";
import {deconflictInterfaceDeclaration} from "./visitor/deconflict/deconflict-interface-declaration";
import {deconflictModuleDeclaration} from "./visitor/deconflict/deconflict-module-declaration";
import {deconflictNamespaceImport} from "./visitor/deconflict/deconflict-namespace-import";
import {deconflictTypeAliasDeclaration} from "./visitor/deconflict/deconflict-type-alias-declaration";
import {deconflictTypeParameterDeclaration} from "./visitor/deconflict/deconflict-type-parameter-declaration";
import {deconflictVariableDeclaration} from "./visitor/deconflict/deconflict-variable-declaration";
import {deconflictIndexSignatureDeclaration} from "./visitor/deconflict/deconflict-index-signature-declaration";
import {DeclarationBundlerOptions} from "../declaration-bundler-options";
import {TS} from "../../../../type/ts";

/**
 * Deconflicts the given Node. Everything but LValues will be updated here
 */
function deconflictNode({node, ...options}: DeconflicterVisitorOptions): TS.Node | undefined {
	if (options.typescript.isBindingElement(node)) {
		return deconflictBindingElement({node, ...options});
	} else if (options.typescript.isClassDeclaration(node)) {
		return deconflictClassDeclaration({node, ...options});
	} else if (options.typescript.isClassExpression(node)) {
		return deconflictClassExpression({node, ...options});
	} else if (options.typescript.isEnumDeclaration(node)) {
		return deconflictEnumDeclaration({node, ...options});
	} else if (options.typescript.isEnumMember(node)) {
		return deconflictEnumMember({node, ...options});
	} else if (options.typescript.isExportSpecifier(node)) {
		return deconflictExportSpecifier({node, ...options});
	} else if (options.typescript.isFunctionDeclaration(node)) {
		return deconflictFunctionDeclaration({node, ...options});
	} else if (options.typescript.isFunctionExpression(node)) {
		return deconflictFunctionExpression({node, ...options});
	} else if (options.typescript.isGetAccessorDeclaration(node)) {
		return deconflictGetAccessorDeclaration({node, ...options});
	} else if (options.typescript.isIdentifier(node)) {
		return deconflictIdentifier({node, ...options});
	} else if (options.typescript.isImportClause(node)) {
		return deconflictImportClause({node, ...options});
	} else if (options.typescript.isImportSpecifier(node)) {
		return deconflictImportSpecifier({node, ...options});
	} else if (options.typescript.isInterfaceDeclaration(node)) {
		return deconflictInterfaceDeclaration({node, ...options});
	}

	// MappedTypeNodes may not be part of the current Typescript version, hence the optional call
	else if (options.typescript.isMappedTypeNode?.(node)) {
		return deconflictMappedTypeNode({node, ...options});
	} else if (options.typescript.isMethodDeclaration(node)) {
		return deconflictMethodDeclaration({node, ...options});
	} else if (options.typescript.isIndexSignatureDeclaration(node)) {
		return deconflictIndexSignatureDeclaration({node, ...options});
	} else if (options.typescript.isMethodSignature(node)) {
		return deconflictMethodSignature({node, ...options});
	} else if (options.typescript.isModuleDeclaration(node)) {
		return deconflictModuleDeclaration({node, ...options});
	} else if (options.typescript.isNamespaceImport(node)) {
		return deconflictNamespaceImport({node, ...options});
	} else if (options.typescript.isParameter(node)) {
		return deconflictParameterDeclaration({node, ...options});
	} else if (options.typescript.isPropertyAssignment(node)) {
		return deconflictPropertyAssignment({node, ...options});
	} else if (options.typescript.isPropertyDeclaration(node)) {
		return deconflictPropertyDeclaration({node, ...options});
	} else if (options.typescript.isPropertySignature(node)) {
		return deconflictPropertySignature({node, ...options});
	} else if (options.typescript.isSetAccessorDeclaration(node)) {
		return deconflictSetAccessorDeclaration({node, ...options});
	} else if (options.typescript.isTypeAliasDeclaration(node)) {
		return deconflictTypeAliasDeclaration({node, ...options});
	} else if (options.typescript.isTypeParameterDeclaration(node)) {
		return deconflictTypeParameterDeclaration({node, ...options});
	} else if (options.typescript.isVariableDeclaration(node)) {
		return deconflictVariableDeclaration({node, ...options});
	} else return options.childContinuation(node, {lexicalEnvironment: options.lexicalEnvironment});
}

/**
 * Deconflicts local bindings
 */
export function deconflicter({declarationFilename, typescript, ...options}: DeclarationBundlerOptions): TS.TransformerFactory<TS.SourceFile> {
	return context => {
		return sourceFile => {
			const sourceFileName = normalize(sourceFile.fileName);

			// If the SourceFile is not part of the local module names, remove all statements from it and return immediately
			if (sourceFileName !== normalize(declarationFilename)) return typescript.updateSourceFileNode(sourceFile, [], true);

			if (options.pluginOptions.debug) {
				console.log(`=== BEFORE DECONFLICTING === (${sourceFileName})`);
				console.log(options.printer.printFile(sourceFile));
			}

			// Prepare some VisitorOptions
			const deconflictVisitorOptions = {
				...options,
				declarationFilename,
				typescript,

				childContinuation: <U extends TS.Node>(node: U, continuationOptions: ContinuationOptions): U =>
					typescript.visitEachChild(
						node,
						nextNode =>
							deconflictNode({
								...deconflictVisitorOptions,
								...continuationOptions,
								node: nextNode
							}),
						context
					),

				continuation: <U extends TS.Node>(node: U, continuationOptions: ContinuationOptions): U =>
					deconflictNode({
						...deconflictVisitorOptions,
						...continuationOptions,
						node
					}) as U
			};

			// Now, deconflict the SourceFile
			const baseContinuationOptions: ContinuationOptions = {
				lexicalEnvironment: {
					parent: undefined,
					bindings: new Map()
				}
			};

			const result = typescript.visitEachChild(
				sourceFile,
				nextNode => deconflictVisitorOptions.continuation(nextNode, baseContinuationOptions),
				context
			);

			if (options.pluginOptions.debug) {
				console.log(`=== AFTER DECONFLICTING === (${sourceFileName})`);
				console.log(options.printer.printFile(result));
			}

			return result;
		};
	};
}
