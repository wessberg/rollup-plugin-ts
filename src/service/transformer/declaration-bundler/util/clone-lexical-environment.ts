import {LexicalEnvironment} from "../transformers/deconflicter/deconflicter-options";

export function cloneLexicalEnvironment(lexicalEnvironment?: LexicalEnvironment | undefined, ...entries: [string, string][]): LexicalEnvironment {
	return {
		parent: lexicalEnvironment,
		bindings: new Map(entries)
	};
}
