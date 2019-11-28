import {LexicalEnvironment} from "../transformers/deconflicter/deconflicter-options";

const SUFFIX = "$";

export function generateUniqueBinding(lexicalEnvironment: LexicalEnvironment, candidate: string): string {
	let counter = -1;

	if (lexicalEnvironment.bindings.has(candidate)) {
		const boundValue = lexicalEnvironment.bindings.get(candidate)!;

		// If the bound value isn't identical to the candidate, it has been deconflicted previously.
		// Start from this value instead
		if (boundValue !== candidate) {
			counter = parseInt(boundValue.slice(candidate.length + SUFFIX.length));
		}

		return `${candidate}${SUFFIX}${counter + 1}`;
	}

	if (lexicalEnvironment.parent == null) {
		return candidate;
	}

	return generateUniqueBinding(lexicalEnvironment.parent, candidate);
}
