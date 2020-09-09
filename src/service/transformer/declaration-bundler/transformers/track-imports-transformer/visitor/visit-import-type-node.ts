import {TS} from "../../../../../../type/ts";
import {TrackImportsTransformerVisitorOptions} from "../track-imports-transformer-visitor-options";

export function visitImportTypeNode({node, typescript, markAsImported, continuation}: TrackImportsTransformerVisitorOptions<TS.ImportTypeNode>): void {
	if (!typescript.isLiteralTypeNode(node.argument) || !typescript.isStringLiteralLike(node.argument.literal)) return;
	const moduleSpecifier = node.argument.literal.text;

	const name =
		node.qualifier == null ? undefined : typescript.isIdentifier(node.qualifier) ? node.qualifier : typescript.isIdentifier(node.qualifier.left) ? node.qualifier.left : undefined;
	if (name != null) {
		markAsImported({
			name,
			moduleSpecifier,
			isDefaultImport: false,
			propertyName: name
		});
	} else {
		markAsImported({
			moduleSpecifier,
			isClauseLessImport: true
		});
	}

	if (node.typeArguments != null) {
		for (const typeArgument of node.typeArguments) {
			continuation(typeArgument);
		}
	}
}
