import {getSymbolAtLocation, GetSymbolAtLocationOptions} from "./get-symbol-at-location";
import {TS} from "../../../../type/ts";

export function getIdForNode(options: GetSymbolAtLocationOptions): number | undefined {
	const symbol = getSymbolAtLocation(options);
	if (symbol == null) return undefined;
	let declaration: TS.Declaration | TS.Type | undefined;

	if (symbol.declarations != null) {
		declaration = symbol.declarations[0];
	} else if (symbol.valueDeclaration != null) {
		declaration = symbol.valueDeclaration;
	} else if ("type" in symbol) {
		declaration = (symbol as {type: TS.Type}).type;
	}

	if (declaration == null) return undefined;
	return ((declaration as unknown) as {id: number}).id;
}
