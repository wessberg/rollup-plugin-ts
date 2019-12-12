import {TS} from "../../../../../../type/ts";
import {TrackExportsTransformerVisitorOptions} from "../track-exports-transformer-visitor-options";
import {getSymbolAtLocation} from "../../../util/get-symbol-at-location";
import {traceIdentifiers} from "../../trace-identifiers/trace-identifiers";

export function visitExportAssignment({
	node,
	typescript,
	markAsExported,
	resolver,
	sourceFile,
	nodeIdentifierCache,
	...options
}: TrackExportsTransformerVisitorOptions<TS.ExportAssignment>): TS.ExportAssignment {
	const [firstIdentifier] = traceIdentifiers({node: node.expression, resolver, sourceFile, nodeIdentifierCache, typescript});
	const symbol = getSymbolAtLocation({...options, typescript, node: node.expression});

	if (firstIdentifier != null) {
		markAsExported({
			symbol,
			isDefaultExport: true,
			moduleSpecifier: undefined,
			name: firstIdentifier[0],
			propertyName: firstIdentifier[0]
		});
	}

	return node;
}
