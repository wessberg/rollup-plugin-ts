import type {TS} from "../../../../../../type/ts.js";
import type {TrackExportsTransformerVisitorOptions} from "../track-exports-transformer-visitor-options.js";

export function visitExportAssignment(options: TrackExportsTransformerVisitorOptions<TS.ExportAssignment>): void {
	const {node, typescript, markAsExported} = options;
	const identifier = typescript.isIdentifier(node.expression) ? node.expression : undefined;

	if (identifier != null) {
		markAsExported({
			isDefaultExport: true,
			isTypeOnly: false,
			moduleSpecifier: undefined,
			name: identifier,
			propertyName: identifier
		});
	}
}
