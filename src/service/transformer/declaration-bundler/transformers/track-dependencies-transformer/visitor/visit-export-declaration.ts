import {TS} from "../../../../../../type/ts.js";
import {TrackDependenciesTransformerVisitorOptions} from "../track-dependencies-transformer-visitor-options.js";

export function visitExportDeclaration({node, typescript, host, sourceFile, addDependency}: TrackDependenciesTransformerVisitorOptions<TS.ExportDeclaration>): void {
	if (node.moduleSpecifier == null || !typescript.isStringLiteralLike(node.moduleSpecifier)) return;

	const resolvedModule = host.resolve(node.moduleSpecifier.text, sourceFile.fileName);
	if (resolvedModule != null) {
		addDependency({
			...resolvedModule,
			moduleSpecifier: node.moduleSpecifier.text
		});
	}
}
