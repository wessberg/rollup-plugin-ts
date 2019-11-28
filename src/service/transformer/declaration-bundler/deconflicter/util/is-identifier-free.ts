import {LexicalEnvironment} from "../deconflicter-visitor-options";

export function isIdentifierFree(lexicalEnvironment: LexicalEnvironment, identifier: string): boolean {
	// So long as the current lexical environment doesn't already define the provided identifier,
	// it can be declared, even if it may shadow an existing identifier from the parent chain of Lexical environments
	return !lexicalEnvironment.bindings.has(identifier);
}
