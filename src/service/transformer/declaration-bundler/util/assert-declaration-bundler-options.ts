import {DeclarationBundlerOptions} from "../declaration-bundler-options";

export function isUninitializedDeclarationBundlerOptions(options: DeclarationBundlerOptions): boolean {
	return options.sourceFileToImportedSymbolSet.size === 0 || options.sourceFileToExportedSymbolSet.size === 0;
}
