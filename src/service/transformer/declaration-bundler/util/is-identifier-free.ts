import {LexicalEnvironment} from "../transformers/deconflicter/deconflicter-options.js";

export function isIdentifierFree(lexicalEnvironment: LexicalEnvironment, identifier: string, originalSourceFileName: string, isInternalAlias = false): boolean {
	// So long as the current lexical environment doesn't already define the provided identifier,
	// it can be declared, even if it may shadow an existing identifier from the parent chain of Lexical environments
	const binding = lexicalEnvironment.bindings.get(identifier);

	// if there is no binding, the identifier is free
	if (binding == null) return true;

	// Otherwise, the identifier is free if and only if it was originally declared in the same SourceFile (in which case it follows the
	// declaration merging rules outlined here: https://www.typescriptlang.org/docs/handbook/declaration-merging.html
	return !isInternalAlias && binding.originalSourceFileName === originalSourceFileName;
}
