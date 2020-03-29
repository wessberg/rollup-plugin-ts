import {TS} from "./ts";

export interface SafeNode extends TS.Node {
	_symbol?: TS.Symbol;
	symbol?: TS.Symbol;

	_original?: SafeNode;
	original?: SafeNode;

	_parent?: SafeNode;
}
