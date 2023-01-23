import type {LexicalEnvironment} from "../transformers/deconflicter/deconflicter-options.js";

export function addBindingToLexicalEnvironment(lexicalEnvironment: LexicalEnvironment, originalSourceFileName: string, value: string, oldValue: string = value): void {
	lexicalEnvironment.bindings.set(oldValue, {originalSourceFileName, value});
}

export function removeBindingFromLexicalEnvironment(lexicalEnvironment: LexicalEnvironment, key: string): void {
	lexicalEnvironment.bindings.delete(key);
}
