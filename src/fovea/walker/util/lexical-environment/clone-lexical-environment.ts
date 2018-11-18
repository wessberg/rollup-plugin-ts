import {LexicalEnvironment} from "./lexical-environment";

/**
 * Clones the given LexicalEnvironment
 * @param {LexicalEnvironment} environment
 * @returns {LexicalEnvironment}
 */
export function cloneLexicalEnvironment (environment: LexicalEnvironment): LexicalEnvironment {
	return JSON.parse(JSON.stringify(environment));
}