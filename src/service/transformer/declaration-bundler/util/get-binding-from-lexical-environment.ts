import {LexicalEnvironment} from "../transformers/deconflicter/deconflicter-options.js";

export function getBindingFromLexicalEnvironment(lexicalEnvironment: LexicalEnvironment, key: string): string | undefined {
	if (lexicalEnvironment.bindings.has(key)) {
		return lexicalEnvironment.bindings.get(key)!.value;
	} else if (lexicalEnvironment.parent != null) {
		return getBindingFromLexicalEnvironment(lexicalEnvironment.parent, key);
	} else {
		return undefined;
	}
}
