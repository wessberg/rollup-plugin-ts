import {TS} from "../../../../../../type/ts";
import {TrackDependenciesTransformerVisitorOptions} from "../track-dependencies-transformer-visitor-options";

export function visitImportDeclaration({node, typescript, host, sourceFile, addDependency}: TrackDependenciesTransformerVisitorOptions<TS.ImportDeclaration>): void {
	if (!typescript.isStringLiteralLike(node.moduleSpecifier)) return;
	const resolvedModule = host.resolve(node.moduleSpecifier.text, sourceFile.fileName);
	if (resolvedModule != null) {
		addDependency(resolvedModule);
	}
}
