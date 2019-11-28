import {DeclarationPreBundlerOptions, LocalSymbol} from "../declaration-pre-bundler-options";
import {getChunkFilename} from "../util/get-chunk-filename/get-chunk-filename";
import {normalize} from "path";
import {traceIdentifiers} from "./visitor/trace-identifiers/trace-identifiers";
import {TS} from "../../../../type/ts";

/**
 * Tracks local bindings across modules
 */
export function trackLocals({typescript, ...options}: DeclarationPreBundlerOptions): TS.TransformerFactory<TS.SourceFile> {
	return _ => {
		return sourceFile => {
			const sourceFileName = normalize(sourceFile.fileName);
			// If the SourceFile is not part of the local module names, remove all statements from it and return immediately
			if (!options.localModuleNames.includes(sourceFileName)) return typescript.updateSourceFileNode(sourceFile, [], true);

			if (options.pluginOptions.debug) {
				console.log(`=== BEFORE TRACKING LOCALS === (${sourceFileName})`);
				console.log(options.printer.printFile(sourceFile));
			}

			const chunkFileNameResult = getChunkFilename({...options, fileName: sourceFileName});

			// If no chunk file name could be detected, skip this file
			if (chunkFileNameResult == null) {
				return typescript.updateSourceFileNode(sourceFile, [], true);
			}

			let localSymbolMap = options.sourceFileToLocalSymbolMap.get(sourceFileName);

			if (localSymbolMap == null) {
				localSymbolMap = new Map();
				options.sourceFileToLocalSymbolMap.set(sourceFileName, localSymbolMap);
			}

			// Prepare some VisitorOptions
			const sharedVisitorOptions = {
				...options,
				typescript
			};

			// Prepare some VisitorOptions
			const traceIdentifiersVisitorOptions = {
				...sharedVisitorOptions,

				childContinuation: <U extends TS.Node>(node: U): TS.Node | void => {
					typescript.forEachChild(node, newNode => traceIdentifiers({...traceIdentifiersVisitorOptions, node: newNode, sourceFile}));
				},
				continuation: <U extends TS.Node>(node: U): TS.Node | void => traceIdentifiers({...traceIdentifiersVisitorOptions, node, sourceFile}),

				addIdentifier(name: string, localSymbol: LocalSymbol): void {
					localSymbolMap!.set(name, localSymbol);
				}
			};

			// Walk through all Statements of the SourceFile and trace identifiers for them
			typescript.forEachChild(sourceFile, traceIdentifiersVisitorOptions.continuation);

			if (options.pluginOptions.debug) {
				console.log(`=== AFTER TRACKING LOCALS === (${sourceFileName})`);
				console.log(options.printer.printFile(sourceFile));
			}

			return sourceFile;
		};
	};
}
