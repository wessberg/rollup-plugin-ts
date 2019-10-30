import {
	createIdentifier,
	forEachChild,
	Identifier,
	isBindingElement,
	isExportSpecifier,
	isGetAccessorDeclaration,
	isIdentifier,
	isImportSpecifier,
	isMappedTypeNode,
	isMethodDeclaration,
	isMethodSignature,
	isParameter,
	isPropertyAssignment,
	isPropertyDeclaration,
	isPropertySignature,
	isSetAccessorDeclaration,
	Node,
	SourceFile,
	TransformerFactory,
	updateSourceFileNode,
	visitEachChild
} from "typescript";
import {
	DeclarationPreBundlerOptions,
	LocalSymbol,
	SourceFileToGeneratedVariableNameSet,
	SourceFileToLocalSymbolMap
} from "../declaration-pre-bundler-options";
import {getChunkFilename} from "../util/get-chunk-filename/get-chunk-filename";
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
import {traceIdentifiers} from "./visitor/trace-identifiers/trace-identifiers";

/**
 * Deconflicts the given Node. Everything but LValues will be updated here
 * @param {DeconflicterVisitorOptions} options
 * @return {Node?}
 */
function deconflictNode({node, ...rest}: DeconflicterVisitorOptions): Node | undefined {
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
 * // Deconflict symbols across modules
 * @param {DeclarationPreBundlerOptions} options
 * @return {TransformerFactory<SourceFile>}
 */
export function deconflicter(options: DeclarationPreBundlerOptions): TransformerFactory<SourceFile> {
	const sourceFileToGeneratedVariableNameSet: SourceFileToGeneratedVariableNameSet = new Map();
	const sourceFileToLocalSymbolMap: SourceFileToLocalSymbolMap = new Map();

	return context => {
		return sourceFile => {
			const sourceFileName = normalize(sourceFile.fileName);
			// If the SourceFile is not part of the local module names, remove all statements from it and return immediately
			if (!options.localModuleNames.includes(sourceFileName)) return updateSourceFileNode(sourceFile, [], true);

			if (options.pluginOptions.debug) {
				console.log(`=== BEFORE DECONFLICTING === (${sourceFileName})`);
				console.log(options.printer.printFile(sourceFile));
			}

			const chunkFilename = getChunkFilename(sourceFileName, options.supportedExtensions, options.chunkToOriginalFileMap);

			let localSymbolMap = sourceFileToLocalSymbolMap.get(sourceFileName);

			let updatedIdentifierNamesForModule = options.updatedIdentifierNamesForModuleMap.get(sourceFileName);
			let updatedIdentifierNamesForModuleReversed = options.updatedIdentifierNamesForModuleMapReversed.get(sourceFileName);
			let generatedVariableNameSet = sourceFileToGeneratedVariableNameSet.get(chunkFilename);

			if (localSymbolMap == null) {
				localSymbolMap = new Map();
				sourceFileToLocalSymbolMap.set(sourceFileName, localSymbolMap);
			}

			if (updatedIdentifierNamesForModule == null) {
				updatedIdentifierNamesForModule = new Map();
				options.updatedIdentifierNamesForModuleMap.set(sourceFileName, updatedIdentifierNamesForModule);
			}

			if (updatedIdentifierNamesForModuleReversed == null) {
				updatedIdentifierNamesForModuleReversed = new Map();
				options.updatedIdentifierNamesForModuleMapReversed.set(sourceFileName, updatedIdentifierNamesForModuleReversed);
			}

			if (generatedVariableNameSet == null) {
				generatedVariableNameSet = new Set();
				sourceFileToGeneratedVariableNameSet.set(chunkFilename, generatedVariableNameSet);
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
					if (generatedVariableNameSet!.has(currentCandidate)) {
						counter++;
					} else {
						generatedVariableNameSet!.add(currentCandidate);
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
				console.log(options.printer.printFile(result));
			}

			return result;
		};
	};
}
