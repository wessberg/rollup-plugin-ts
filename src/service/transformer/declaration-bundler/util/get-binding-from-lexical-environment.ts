import {LexicalEnvironment} from "../transformers/deconflicter/deconflicter-options";

export function getBindingFromLexicalEnvironment(lexicalEnvironment: LexicalEnvironment, key: string): string | undefined {
	if (lexicalEnvironment.bindings.has(key)) {
		return lexicalEnvironment.bindings.get(key);
	} else if (lexicalEnvironment.parent != null) {
		return getBindingFromLexicalEnvironment(lexicalEnvironment.parent, key);
	} else {
		return undefined;
	}
}

export function getReverseBindingFromLexicalEnvironment(lexicalEnvironment: LexicalEnvironment, value: string): string | undefined {
	for (const [key, boundValue] of lexicalEnvironment.bindings) {
		if (boundValue === value) {
			return key;
		}
	}
	if (lexicalEnvironment.parent != null) {
		return getReverseBindingFromLexicalEnvironment(lexicalEnvironment.parent, value);
	} else {
		return undefined;
	}
}
