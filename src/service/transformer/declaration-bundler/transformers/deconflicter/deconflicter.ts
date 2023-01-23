import type {DeconflicterVisitorOptions} from "./deconflicter-visitor-options.js";
import type {TS} from "../../../../../type/ts.js";
import {deconflictBindingElement} from "./visitor/deconflict-binding-element.js";
import {deconflictClassDeclaration} from "./visitor/deconflict-class-declaration.js";
import {deconflictClassExpression} from "./visitor/deconflict-class-expression.js";
import {deconflictEnumDeclaration} from "./visitor/deconflict-enum-declaration.js";
import {deconflictEnumMember} from "./visitor/deconflict-enum-member.js";
import {deconflictExportSpecifier} from "./visitor/deconflict-export-specifier.js";
import {deconflictFunctionDeclaration} from "./visitor/deconflict-function-declaration.js";
import {deconflictFunctionExpression} from "./visitor/deconflict-function-expression.js";
import {deconflictGetAccessorDeclaration} from "./visitor/deconflict-get-accessor-declaration.js";
import {deconflictIdentifier} from "./visitor/deconflict-identifier.js";
import {deconflictImportClause} from "./visitor/deconflict-import-clause.js";
import {deconflictImportSpecifier} from "./visitor/deconflict-import-specifier.js";
import {deconflictInterfaceDeclaration} from "./visitor/deconflict-interface-declaration.js";
import {deconflictMappedTypeNode} from "./visitor/deconflict-mapped-type-node.js";
import {deconflictMethodDeclaration} from "./visitor/deconflict-method-declaration.js";
import {deconflictIndexSignatureDeclaration} from "./visitor/deconflict-index-signature-declaration.js";
import {deconflictMethodSignature} from "./visitor/deconflict-method-signature.js";
import {deconflictModuleDeclaration} from "./visitor/deconflict-module-declaration.js";
import {deconflictNamespaceImport} from "./visitor/deconflict-namespace-import.js";
import {deconflictParameterDeclaration} from "./visitor/deconflict-parameter-declaration.js";
import {deconflictPropertyAssignment} from "./visitor/deconflict-property-assignment.js";
import {deconflictPropertyDeclaration} from "./visitor/deconflict-property-declaration.js";
import {deconflictPropertySignature} from "./visitor/deconflict-property-signature.js";
import {deconflictSetAccessorDeclaration} from "./visitor/deconflict-set-accessor-declaration.js";
import {deconflictTypeAliasDeclaration} from "./visitor/deconflict-type-alias-declaration.js";
import {deconflictTypeParameterDeclaration} from "./visitor/deconflict-type-parameter-declaration.js";
import {deconflictVariableDeclaration} from "./visitor/deconflict-variable-declaration.js";
import type {ContinuationOptions} from "./deconflicter-options.js";
import type {SourceFileBundlerVisitorOptions} from "../source-file-bundler/source-file-bundler-visitor-options.js";
import {shouldDebugMetrics, shouldDebugSourceFile} from "../../../../../util/is-debug/should-debug.js";
import {logMetrics} from "../../../../../util/logging/log-metrics.js";
import {logTransformer} from "../../../../../util/logging/log-transformer.js";
import {preserveMeta} from "../../util/clone-node-with-meta.js";
import {deconflictFunctionTypeNode} from "./visitor/deconflict-function-type.js";
import {deconflictImportTypeNode} from "./visitor/deconflict-import-type-node.js";
import {deconflictConstructorDeclaration} from "./visitor/deconflict-constructor-declaration.js";
import {deconflictCallSignatureDeclaration} from "./visitor/deconflict-call-signature-declaration.js";
import {deconflictQualifiedName} from "./visitor/deconflict-qualified-name.js";
import {deconflictImportEqualsDeclaration} from "./visitor/deconflict-import-equals-declaration.js";

/**
 * Deconflicts the given Node. Everything but LValues will be updated here
 */
function deconflictNode({node, ...options}: DeconflicterVisitorOptions<TS.Node>): TS.Node | undefined {
	if (options.typescript.isBindingElement(node)) {
		return deconflictBindingElement({node, ...options});
	} else if (options.typescript.isQualifiedName(node)) {
		return deconflictQualifiedName({node, ...options});
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
	} else if (options.typescript.isConstructorDeclaration(node)) {
		return deconflictConstructorDeclaration({node, ...options});
	} else if (options.typescript.isFunctionTypeNode(node)) {
		return deconflictFunctionTypeNode({node, ...options});
	} else if (options.typescript.isGetAccessorDeclaration(node)) {
		return deconflictGetAccessorDeclaration({node, ...options});
	} else if (options.typescript.isIdentifier(node)) {
		return deconflictIdentifier({node, ...options});
	} else if (options.typescript.isImportClause(node)) {
		return deconflictImportClause({node, ...options});
	} else if (options.typescript.isImportEqualsDeclaration(node)) {
		return deconflictImportEqualsDeclaration({node, ...options});
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
	} else if (options.typescript.isCallSignatureDeclaration(node)) {
		return deconflictCallSignatureDeclaration({node, ...options});
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
	} else if (options.typescript.isImportTypeNode(node)) {
		return deconflictImportTypeNode({node, ...options});
	} else if (options.typescript.isTypeParameterDeclaration(node)) {
		return deconflictTypeParameterDeclaration({node, ...options});
	} else if (options.typescript.isVariableDeclaration(node)) {
		return deconflictVariableDeclaration({node, ...options});
	} else return options.childContinuation(node, {lexicalEnvironment: options.lexicalEnvironment});
}

/**
 * Deconflicts local bindings
 */
export function deconflicter(options: SourceFileBundlerVisitorOptions): TS.SourceFile {
	const {typescript, context, sourceFile, pluginOptions, printer, lexicalEnvironment} = options;

	const fullBenchmark = shouldDebugMetrics(pluginOptions.debug, sourceFile) ? logMetrics(`Deconflicting`, sourceFile.fileName) : undefined;

	const transformationLog = shouldDebugSourceFile(pluginOptions.debug, sourceFile) ? logTransformer("Deconflicting", sourceFile, printer) : undefined;

	// Prepare some VisitorOptions
	const visitorOptions = {
		...options,

		childContinuation: <U extends TS.Node>(node: U, continuationOptions: ContinuationOptions): U =>
			typescript.visitEachChild(
				node,
				nextNode =>
					deconflictNode({
						...visitorOptions,
						...continuationOptions,
						node: nextNode
					}),
				context
			),

		continuation: <U extends TS.Node>(node: U, continuationOptions: ContinuationOptions): U =>
			deconflictNode({
				...visitorOptions,
				...continuationOptions,
				node
			}) as U
	};

	const result = preserveMeta(
		typescript.visitEachChild(sourceFile, nextNode => visitorOptions.continuation(nextNode, {lexicalEnvironment}), context),
		sourceFile,
		options
	);

	transformationLog?.finish(result);
	fullBenchmark?.finish();

	return result;
}
