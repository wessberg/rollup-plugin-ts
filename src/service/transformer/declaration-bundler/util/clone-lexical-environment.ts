import {LexicalEnvironment, LexicalEnvironmentBinding} from "../transformers/deconflicter/deconflicter-options";

export function cloneLexicalEnvironment(lexicalEnvironment?: LexicalEnvironment | undefined, ...entries: [string, LexicalEnvironmentBinding][]): LexicalEnvironment {
	return {
		parent: lexicalEnvironment,
		bindings: new Map(entries)
	};
}
