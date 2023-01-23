import type {LexicalEnvironment, LexicalEnvironmentBinding} from "../transformers/deconflicter/deconflicter-options.js";

export function cloneLexicalEnvironment(lexicalEnvironment?: LexicalEnvironment | undefined, ...entries: [string, LexicalEnvironmentBinding][]): LexicalEnvironment {
	return {
		parent: lexicalEnvironment,
		bindings: new Map(entries)
	};
}
