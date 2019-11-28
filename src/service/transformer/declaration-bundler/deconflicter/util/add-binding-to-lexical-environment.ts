import {LexicalEnvironment} from "../deconflicter-visitor-options";

export function addBindingToLexicalEnvironment(lexicalEnvironment: LexicalEnvironment, value: string, oldValue: string = value): void {
	lexicalEnvironment.bindings.set(oldValue, value);
}
