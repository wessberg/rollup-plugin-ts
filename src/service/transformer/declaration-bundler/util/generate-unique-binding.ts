import {LexicalEnvironment} from "../transformers/deconflicter/deconflicter-options";

export const DECONFLICT_SUFFIX = "$";

export function generateUniqueBinding(lexicalEnvironment: LexicalEnvironment, candidate: string): string {
	let counter = -1;

	if (lexicalEnvironment.bindings.has(candidate)) {
		const {value} = lexicalEnvironment.bindings.get(candidate)!;

		// If the bound value isn't identical to the candidate, it has been deconflicted previously.
		// Start from this value instead
		if (value !== candidate) {
			counter = parseInt(value.slice(candidate.length + DECONFLICT_SUFFIX.length));
		}

		return `${candidate}${DECONFLICT_SUFFIX}${counter + 1}`;
	}

	if (lexicalEnvironment.parent == null) {
		return candidate;
	}

	return generateUniqueBinding(lexicalEnvironment.parent, candidate);
}
