import {LexicalEnvironment} from "../transformers/deconflicter/deconflicter-options";

export function addBindingToLexicalEnvironment(
	lexicalEnvironment: LexicalEnvironment,
	originalSourceFileName: string,
	value: string,
	oldValue: string = value
): void {
	lexicalEnvironment.bindings.set(oldValue, {originalSourceFileName, value});
}
