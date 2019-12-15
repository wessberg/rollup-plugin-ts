import {TS} from "../../../../../../type/ts";
import {TrackExportsTransformerVisitorOptions} from "../track-exports-transformer-visitor-options";

export function visitExportAssignment(options: TrackExportsTransformerVisitorOptions<TS.ExportAssignment>): TS.ExportAssignment {
	const {node, typescript, markAsExported} = options;
	const identifier = typescript.isIdentifier(node.expression) ? node.expression : undefined;

	if (identifier != null) {
		markAsExported({
			isDefaultExport: true,
			moduleSpecifier: undefined,
			name: identifier,
			propertyName: identifier
		});
	}

	return node;
}
