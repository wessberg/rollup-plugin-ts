import {TS} from "../../../../../../type/ts";
import {TrackDependenciesTransformerVisitorOptions} from "../track-dependencies-transformer-visitor-options";

export function visitImportTypeNode({
	node,
	typescript,
	host,
	sourceFile,
	addDependency,
	continuation
}: TrackDependenciesTransformerVisitorOptions<TS.ImportTypeNode>): void {
	if (!typescript.isLiteralTypeNode(node.argument) || !typescript.isStringLiteralLike(node.argument.literal) || node.qualifier == null) return;
	const moduleSpecifier = node.argument.literal.text;

	const resolvedModule = host.resolve(moduleSpecifier, sourceFile.fileName);

	if (resolvedModule != null) {
		addDependency(resolvedModule);
	}

	continuation(node.qualifier);
	if (node.typeArguments != null) {
		for (const typeArgument of node.typeArguments) {
			continuation(typeArgument);
		}
	}
}
