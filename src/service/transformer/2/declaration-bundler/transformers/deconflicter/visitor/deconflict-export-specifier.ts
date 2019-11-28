import {DeconflicterVisitorOptions} from "../deconflicter-visitor-options";
import {TS} from "../../../../../../../type/ts";

/**
 * Deconflicts the given ExportSpecifier.
 */
export function deconflictExportSpecifier({
	node,
	continuation,
	lexicalEnvironment,
	typescript
}: DeconflicterVisitorOptions<TS.ExportSpecifier>): TS.ExportSpecifier | undefined {
	const nameContResult = continuation(node.name, {lexicalEnvironment});

	// If the ExportSpecifier is something like '{Foo}' but 'Foo' has been deconflicted in this SourceFile to something else,
	// we should re-write it to something like '{Foo$0 as Foo}'
	if (node.propertyName == null && nameContResult !== node.name) {
		return typescript.updateExportSpecifier(node, typescript.createIdentifier(nameContResult.text), typescript.createIdentifier(node.name.text));
	}

	const isIdentical = nameContResult === node.name;

	if (isIdentical) {
		return node;
	}

	// If the ExportSpecifier is something like '{Foo as Bar}' but 'Foo' has been deconflicted in this SourceFile to something else,
	// we should re-write it to something like '{Foo$0 as Bar}'
	return typescript.updateExportSpecifier(node, nameContResult, typescript.createIdentifier(node.name.text));
}
