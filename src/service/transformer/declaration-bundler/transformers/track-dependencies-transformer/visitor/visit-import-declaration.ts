import type {TS} from "../../../../../../type/ts.js";
import type {TrackDependenciesTransformerVisitorOptions} from "../track-dependencies-transformer-visitor-options.js";

export function visitImportDeclaration({node, typescript, host, sourceFile, addDependency}: TrackDependenciesTransformerVisitorOptions<TS.ImportDeclaration>): void {
	if (!typescript.isStringLiteralLike(node.moduleSpecifier)) return;
	const resolvedModule = host.resolve(node.moduleSpecifier.text, sourceFile.fileName);
	if (resolvedModule != null) {
		addDependency({
			...resolvedModule,
			moduleSpecifier: node.moduleSpecifier.text
		});
	}
}
