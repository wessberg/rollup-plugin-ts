import {TS} from "./ts";

export interface SafeNode extends TS.Node {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	_symbol?: TS.Symbol;
	symbol?: TS.Symbol;

	// eslint-disable-next-line @typescript-eslint/naming-convention
	_original?: SafeNode;
	original?: SafeNode;

	// eslint-disable-next-line @typescript-eslint/naming-convention
	_parent?: SafeNode;
}
