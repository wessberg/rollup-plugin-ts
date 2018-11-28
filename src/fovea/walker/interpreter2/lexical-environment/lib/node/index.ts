import {console} from "./console";
import {LexicalEnvironment} from "../../lexical-environment";

/**
 * Gets a mocked Node environment
 * @returns {LexicalEnvironment}
 */
export function getNodeLexicalEnvironment (): LexicalEnvironment["env"] {
	return {
		console: console()
	};
}