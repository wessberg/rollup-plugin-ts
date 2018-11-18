import {LiteralResult} from "../literal/literal";

export interface LexicalEnvironment {
	[key: string]: LiteralResult;
}