import {
	createIdentifier,
	createPrinter,
	forEachChild,
	Identifier,
	isBindingElement,
	isClassDeclaration,
	isEnumDeclaration,
	isExportSpecifier,
	isFunctionDeclaration,
	isGetAccessorDeclaration,
	isIdentifier,
	isImportClause,
	isImportSpecifier,
	isInterfaceDeclaration,
	isMappedTypeNode,
	isMethodDeclaration,
	isMethodSignature,
	isNamespaceImport,
	isParameter,
	isPropertyAssignment,
	isPropertyDeclaration,
	isPropertySignature,
	isSetAccessorDeclaration,
	isTypeAliasDeclaration,
	isVariableDeclaration,
	Node,
	SourceFile,
	TransformerFactory,
	updateSourceFileNode,
	visitEachChild
} from "typescript";
import {IDeclarationBundlerOptions, LocalSymbol, SourceFileToLocalSymbolMap} from "../i-declaration-bundler-options";
import {getChunkFilename} from "../util/get-chunk-filename/get-chunk-filename";
import {traceIdentifiersForClassDeclaration} from "./visitor/trace-identifiers/trace-identifiers-for-class-declaration";
import {traceIdentifiersForEnumDeclaration} from "./visitor/trace-identifiers/trace-identifiers-for-enum-declaration";
import {traceIdentifiersForFunctionDeclaration} from "./visitor/trace-identifiers/trace-identifiers-for-function-declaration";
import {traceIdentifiersForInterfaceDeclaration} from "./visitor/trace-identifiers/trace-identifiers-for-interface-declaration";
import {traceIdentifiersForTypeAliasDeclaration} from "./visitor/trace-identifiers/trace-identifiers-for-type-alias-declaration";
import {traceIdentifiersForBindingElement} from "./visitor/trace-identifiers/trace-identifiers-for-binding-element";
import {traceIdentifiersForIdentifier} from "./visitor/trace-identifiers/trace-identifiers-for-identifier";
import {traceIdentifiersForVariableDeclaration} from "./visitor/trace-identifiers/trace-identifiers-for-variable-declaration";
import {TraceIdentifiersVisitorOptions} from "./trace-identifiers-visitor-options";
import {ContinuationOptions, DeconflictVisitorOptions} from "./deconflict-visitor-options";
import {deconflictIdentifier} from "./visitor/deconflict/deconflict-identifier";
import {normalize} from "path";
import {traceIdentifiersForImportSpecifier} from "./visitor/trace-identifiers/trace-identifiers-for-import-specifier";
import {deconflictBindingElement} from "./visitor/deconflict/deconflict-binding-element";
import {deconflictImportSpecifier} from "./visitor/deconflict/deconflict-import-specifier";
import {deconflictPropertySignature} from "./visitor/deconflict/deconflict-property-signature";
import {deconflictMethodSignature} from "./visitor/deconflict/deconflict-method-signature";
import {deconflictMethodDeclaration} from "./visitor/deconflict/deconflict-method-declaration";
import {deconflictPropertyDeclaration} from "./visitor/deconflict/deconflict-property-declaration";
import {deconflictParameterDeclaration} from "./visitor/deconflict/deconflict-parameter-declaration";
import {traceIdentifiersForExportSpecifier} from "./visitor/trace-identifiers/trace-identifiers-for-export-specifier";
import {deconflictExportSpecifier} from "./visitor/deconflict/deconflict-export-specifier";
import {deconflictPropertyAssignment} from "./visitor/deconflict/deconflict-property-assignment";
import {deconflictGetAccessorDeclaration} from "./visitor/deconflict/deconflict-get-accessor-declaration";
import {deconflictSetAccessorDeclaration} from "./visitor/deconflict/deconflict-set-accessor-declaration";
import {deconflictMappedTypeNode} from "./visitor/deconflict/deconflict-mapped-type-node";
import {traceIdentifiersForImportClause} from "./visitor/trace-identifiers/trace-identifiers-for-import-clause";
import {traceIdentifiersForNamespaceImport} from "./visitor/trace-identifiers/trace-identifiers-for-namespace-import";

/**
 * Traces identifiers for the given Node, potentially generating new unique variable names for them
 * @param {Node} node
 * @param {TraceIdentifiersVisitorOptions} options
 * @returns {Node | undefined}
 */
function traceIdentifiers({node, ...rest}: TraceIdentifiersVisitorOptions): void {
	if (isBindingElement(node)) return traceIdentifiersForBindingElement({...rest, node});
	else if (isClassDeclaration(node)) return traceIdentifiersForClassDeclaration({...rest, node});
	else if (isEnumDeclaration(node)) return traceIdentifiersForEnumDeclaration({...rest, node});
	else if (isFunctionDeclaration(node)) return traceIdentifiersForFunctionDeclaration({...rest, node});
	else if (isImportClause(node)) return traceIdentifiersForImportClause({...rest, node});
	else if (isNamespaceImport(node)) return traceIdentifiersForNamespaceImport({...rest, node});
	else if (isImportSpecifier(node)) return traceIdentifiersForImportSpecifier({...rest, node});
	else if (isExportSpecifier(node)) return traceIdentifiersForExportSpecifier({...rest, node});
	else if (isIdentifier(node)) return traceIdentifiersForIdentifier({...rest, node});
	else if (isInterfaceDeclaration(node)) return traceIdentifiersForInterfaceDeclaration({...rest, node});
	else if (isTypeAliasDeclaration(node)) return traceIdentifiersForTypeAliasDeclaration({...rest, node});
	else if (isVariableDeclaration(node)) return traceIdentifiersForVariableDeclaration({...rest, node});
	else return rest.childContinuation(node);
}

/**
 * Deconflicts the given Node. Everything but LValues will be updated here
 * @param {DeconflictVisitorOptions} options
 * @return {Node?}
 */
function deconflictNode({node, ...rest}: DeconflictVisitorOptions): Node | undefined {
	if (isBindingElement(node)) {
		return deconflictBindingElement({node, ...rest});
	} else if (isImportSpecifier(node)) {
		return deconflictImportSpecifier({node, ...rest});
	} else if (isExportSpecifier(node)) {
		return deconflictExportSpecifier({node, ...rest});
	} else if (isPropertySignature(node)) {
		return deconflictPropertySignature({node, ...rest});
	} else if (isPropertyDeclaration(node)) {
		return deconflictPropertyDeclaration({node, ...rest});
	} else if (isPropertyAssignment(node)) {
		return deconflictPropertyAssignment({node, ...rest});
	} else if (isMethodSignature(node)) {
		return deconflictMethodSignature({node, ...rest});
	} else if (isMethodDeclaration(node)) {
		return deconflictMethodDeclaration({node, ...rest});
	} else if (isGetAccessorDeclaration(node)) {
		return deconflictGetAccessorDeclaration({node, ...rest});
	} else if (isSetAccessorDeclaration(node)) {
		return deconflictSetAccessorDeclaration({node, ...rest});
	} else if (isParameter(node)) {
		return deconflictParameterDeclaration({node, ...rest});
	} else if (isMappedTypeNode(node)) {
		return deconflictMappedTypeNode({node, ...rest});
	} else if (isIdentifier(node)) {
		return deconflictIdentifier({node, ...rest});
	} else return rest.childContinuation(node, {lValues: rest.lValues, lexicalIdentifiers: rest.lexicalIdentifiers});
}

/**
 * Deconflicts local identifiers such that they won't interfere with identifiers across modules
 * for the same chunk
 * @param {IDeclarationBundlerOptions} options
 * @return {TransformerFactory<SourceFile>}
 */
export function deconflict(options: IDeclarationBundlerOptions): TransformerFactory<SourceFile> {
	const sourceFileToLocalSymbolMap: SourceFileToLocalSymbolMap = new Map();

	const rootLevelIdentifiersForModuleMap: Map<string, Map<string, false | string>> = new Map();
	const generatedVariableNamesForChunkMap: Map<string, Set<string>> = new Map();

	return context => {
		return sourceFile => {
			const sourceFileName = normalize(sourceFile.fileName);
			// If the SourceFile is not part of the local module names, remove all statements from it and return immediately
			if (!options.localModuleNames.includes(sourceFileName)) return updateSourceFileNode(sourceFile, [], true);

			if (options.pluginOptions.debug) {
				console.log(`=== BEFORE DECONFLICTING === (${sourceFileName})`);
				console.log(createPrinter().printFile(sourceFile));
			}

			const chunkFilename = getChunkFilename(sourceFileName, options.supportedExtensions, options.chunkToOriginalFileMap);

			let localSymbolMap = sourceFileToLocalSymbolMap.get(sourceFileName);

			let rootLevelIdentifiersForModule = rootLevelIdentifiersForModuleMap.get(sourceFileName);
			let updatedIdentifierNamesForModule = options.updatedIdentifierNamesForModuleMap.get(sourceFileName);
			let updatedIdentifierNamesForModuleReversed = options.updatedIdentifierNamesForModuleMapReversed.get(sourceFileName);
			let generatedVariableNamesForChunk = generatedVariableNamesForChunkMap.get(chunkFilename);

			if (localSymbolMap == null) {
				localSymbolMap = new Map();
				sourceFileToLocalSymbolMap.set(sourceFileName, localSymbolMap);
			}

			if (rootLevelIdentifiersForModule == null) {
				rootLevelIdentifiersForModule = new Map();
				rootLevelIdentifiersForModuleMap.set(sourceFileName, rootLevelIdentifiersForModule);
			}

			if (updatedIdentifierNamesForModule == null) {
				updatedIdentifierNamesForModule = new Map();
				options.updatedIdentifierNamesForModuleMap.set(sourceFileName, updatedIdentifierNamesForModule);
			}

			if (updatedIdentifierNamesForModuleReversed == null) {
				updatedIdentifierNamesForModuleReversed = new Map();
				options.updatedIdentifierNamesForModuleMapReversed.set(sourceFileName, updatedIdentifierNamesForModuleReversed);
			}

			if (generatedVariableNamesForChunk == null) {
				generatedVariableNamesForChunk = new Set();
				generatedVariableNamesForChunkMap.set(chunkFilename, generatedVariableNamesForChunk);
			}

			// Prepare some VisitorOptions
			const sharedVisitorOptions = {
				...options
			};

			const isIdentifierFree = (identifier: string, currentSourceFileName: string = sourceFileName): boolean => {
				const currentLocalSymbols = sourceFileToLocalSymbolMap.get(currentSourceFileName);
				for (const module of options.localModuleNames) {
					// Skip the current module
					if (module === currentSourceFileName) continue;

					const otherLocalSymbols = sourceFileToLocalSymbolMap.get(module);

					// If this other module (that will be part of the same chunk) also declares the identifier
					// it probably isn't free. But it may be, though, if it directly references the identifier we're checking
					// for conflicts, for example if it is part of an import declaration.
					if (otherLocalSymbols != null && otherLocalSymbols.has(identifier)) {
						const otherLocalSymbol = otherLocalSymbols.get(identifier)!;
						const currentLocalSymbol = currentLocalSymbols == null ? undefined : currentLocalSymbols.get(identifier);

						if (currentLocalSymbol == null) return true;

						if (otherLocalSymbol.originalModule === currentLocalSymbol.originalModule) {
							return true;
						} else {
							return false;
						}
					}
				}
				return true;
			};

			const generateUniqueVariableName = (candidate: string): string => {
				const suffix = "_$";
				let counter = 0;

				while (true) {
					let currentCandidate = candidate + suffix + counter;
					if (generatedVariableNamesForChunk!.has(currentCandidate)) {
						counter++;
					} else {
						generatedVariableNamesForChunk!.add(currentCandidate);
						return currentCandidate;
					}
				}
			};

			const updateIdentifierName = (oldName: string, newName: string): void => {
				updatedIdentifierNamesForModule!.set(oldName, newName);
				updatedIdentifierNamesForModuleReversed!.set(newName, oldName);
			};

			// Prepare some VisitorOptions
			const traceIdentifiersVisitorOptions = {
				...sharedVisitorOptions,

				childContinuation: <U extends Node>(node: U): Node | void => {
					forEachChild(node, newNode => traceIdentifiers({...traceIdentifiersVisitorOptions, node: newNode, sourceFile}));
				},
				continuation: <U extends Node>(node: U): Node | void => traceIdentifiers({...traceIdentifiersVisitorOptions, node, sourceFile}),

				addIdentifier(name: string, localSymbol: LocalSymbol): void {
					localSymbolMap!.set(name, localSymbol);
				}
			};

			// Prepare some VisitorOptions
			const deconflictVisitorOptions = {
				...sharedVisitorOptions,

				childContinuation: <U extends Node>(node: U, continuationOptions: ContinuationOptions): U =>
					visitEachChild(
						node,
						nextNode =>
							deconflictNode({
								...deconflictVisitorOptions,
								...continuationOptions,
								node: nextNode
							}),
						context
					),

				continuation: <U extends Node>(node: U, continuationOptions: ContinuationOptions): U | undefined =>
					deconflictNode({
						...deconflictVisitorOptions,
						...continuationOptions,
						node
					}) as U | undefined,

				updateIdentifierIfNeeded(identifier: Identifier, {lexicalIdentifiers, lValues}: ContinuationOptions): Identifier {
					if (lValues.has(identifier) || (lexicalIdentifiers != null && lexicalIdentifiers.has(identifier.text))) return identifier;

					if (isIdentifierFree(identifier.text)) {
						return identifier;
					} else {
						let uniqueIdentifier = updatedIdentifierNamesForModule!.get(identifier.text);
						if (uniqueIdentifier == null) {
							uniqueIdentifier = generateUniqueVariableName(identifier.text);
							updateIdentifierName(identifier.text, uniqueIdentifier);
						}
						return createIdentifier(uniqueIdentifier);
					}
				}
			};

			// Walk through all Statements of the SourceFile and trace identifiers for them
			forEachChild(sourceFile, traceIdentifiersVisitorOptions.continuation);

			// Now, deconflict the SourceFile
			const baseContinuationOptions: ContinuationOptions = {
				lexicalIdentifiers: new Set(),
				lValues: new Set()
			};

			const result = visitEachChild(sourceFile, nextNode => deconflictVisitorOptions.continuation(nextNode, baseContinuationOptions), context);

			if (options.pluginOptions.debug) {
				console.log(`=== AFTER DECONFLICTING === (${sourceFileName})`);
				console.log(createPrinter().printFile(result));
			}

			return result;
		};
	};
}
