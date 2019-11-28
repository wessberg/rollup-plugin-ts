import {LexicalEnvironment} from "../deconflicter-visitor-options";

export function cloneLexicalEnvironment(lexicalEnvironment: LexicalEnvironment, ...entries: [string, string][]): LexicalEnvironment {
	return {
		parent: lexicalEnvironment,
		bindings: new Map(entries)
	};
}
