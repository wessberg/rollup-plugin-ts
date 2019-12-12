import {getSymbolAtLocation, GetSymbolAtLocationOptions} from "./get-symbol-at-location";

export function getIdForNode(options: GetSymbolAtLocationOptions): number | undefined {
	const symbol = getSymbolAtLocation(options);
	if (symbol == null) return undefined;
	const [declaration] = symbol.declarations;
	if (declaration == null) return undefined;
	return ((declaration as unknown) as {id: number}).id;
}
