import {TS} from "../../../../../../type/ts.js";
import {TrackDependenciesTransformerVisitorOptions} from "../track-dependencies-transformer-visitor-options.js";

export function visitImportTypeNode({node, typescript, host, sourceFile, addDependency, continuation}: TrackDependenciesTransformerVisitorOptions<TS.ImportTypeNode>): void {
	if (!typescript.isLiteralTypeNode(node.argument) || !typescript.isStringLiteralLike(node.argument.literal)) return;
	const moduleSpecifier = node.argument.literal.text;

	const resolvedModule = host.resolve(moduleSpecifier, sourceFile.fileName);

	if (resolvedModule != null) {
		addDependency({
			...resolvedModule,
			moduleSpecifier
		});
	}

	if (node.qualifier != null) {
		continuation(node.qualifier);
	}

	if (node.typeArguments != null) {
		for (const typeArgument of node.typeArguments) {
			continuation(typeArgument);
		}
	}
}
