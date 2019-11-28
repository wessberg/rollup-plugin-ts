import {SourceDescription} from "rollup";
import {declarationBundler} from "../service/transformer/declaration-bundler/declaration-bundler";
import {PreBundleDeclarationsForChunkOptions} from "./pre-bundle-declarations-for-chunk";
import {TS} from "../type/ts";

export interface BundleDeclarationsForChunkOptions extends PreBundleDeclarationsForChunkOptions {
	preBundleResult: SourceDescription;
}

export function bundleDeclarationsForChunk(options: BundleDeclarationsForChunkOptions): SourceDescription {
	// Run a tree-shaking pass on the code
	const result = options.typescript.transform(
		options.typescript.createSourceFile(
			options.declarationFilename,
			options.preBundleResult.code,
			options.typescript.ScriptTarget.ESNext,
			true,
			options.typescript.ScriptKind.TS
		),
		declarationBundler({
			...options
		}).afterDeclarations! as TS.TransformerFactory<TS.SourceFile>[],
		options.languageServiceHost.getCompilationSettings()
	);

	// Print the Source code and update the code with it
	let code = options.printer.printFile(result.transformed[0]);

	// Add a source mapping URL if a map should be generated
	if (options.generateMap) {
		code += (code.endsWith("\n") ? "" : "\n") + `//# sourceMappingURL=${options.rewrittenDeclarationMapFilename}`;
	}

	return {
		...options.preBundleResult,
		code
	};
}
