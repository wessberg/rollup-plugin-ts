import {Node, NodeArray} from "typescript";
import {Literal} from "../literal/literal";
import {RealmImplementation} from "../realm/realm";
import {getNodeLexicalEnvironment} from "./lib/node/index";
import {has, set, get} from "object-path";

export interface LexicalEnvironment {
	parentEnv: LexicalEnvironment|undefined;
	env: {[key: string]: Literal};
}

const LEXICAL_ENVIRONMENT_MAP: WeakMap<Node|NodeArray<Node>, LexicalEnvironment> = new WeakMap();

/**
 * Returns true if a lexical environment has been computed for the given Node
 * @param {T} node
 * @returns {boolean}
 */
export function hasLexicalEnvironmentForNode<T extends Node> (node: T): boolean {
	return LEXICAL_ENVIRONMENT_MAP.has(node);
}

/**
 * Gets the Lexical Environment for the given node
 * @param {Node} node
 * @param {LexicalEnvironment} initialEnvironment
 * @returns {LexicalEnvironment}
 */
export function getLexicalEnvironmentForNode<T extends Node, U extends (T|NodeArray<T>) = T> (node: U, initialEnvironment: LexicalEnvironment["env"]): LexicalEnvironment {

	const env = LEXICAL_ENVIRONMENT_MAP.get(node);
	if (env != null) return env;
	return setLexicalEnvironmentForNode(node, createLexicalEnvironment(initialEnvironment));
}

/**
 * Gets a value from a Lexical Environment
 * @param {LexicalEnvironment} env
 * @param {string} path
 * @returns {LexicalEnvironment["env]|undefined}
 */
export function getRelevantDictFromLexicalEnvironment (env: LexicalEnvironment, path: string): LexicalEnvironment["env"]|undefined {
	if (has(env.env, path)) return env.env;
	if (env.parentEnv != null) return getRelevantDictFromLexicalEnvironment(env.parentEnv, path);
	return undefined;
}

/**
 * Gets a value from a Lexical Environment
 * @param {LexicalEnvironment} env
 * @param {string} path
 * @returns {LexicalEnvironment}
 */
export function getFromLexicalEnvironment (env: LexicalEnvironment, path: string): Literal {
	if (has(env.env, path)) return get(env.env, path);
	if (env.parentEnv != null) return getFromLexicalEnvironment(env.parentEnv, path);
}

/**
 * Gets a value from a Lexical Environment
 * @param {LexicalEnvironment} env
 * @param {string} path
 * @param {Literal} value
 * @param {boolean} [newBinding=false]
 */
export function setInLexicalEnvironment (env: LexicalEnvironment, path: string, value: Literal, newBinding: boolean = false): void {
	if (has(env.env, path) || newBinding || env.parentEnv == null) {
		set(env.env, path, value);
	}

	else {
		let currentParentEnv: LexicalEnvironment|undefined = env.parentEnv;
		while (currentParentEnv != null) {
			if (has(currentParentEnv.env, path)) {
				set(currentParentEnv.env, path, value);
				return;
			}
			else {
				currentParentEnv = currentParentEnv.parentEnv;
			}
		}
	}
}

/**
 * Gets the Lexical Environment for the given node
 * @param {Node} node
 * @param {LexicalEnvironment} lexicalEnvironment
 * @returns {LexicalEnvironment}
 */
export function setLexicalEnvironmentForNode<T extends Node, U extends (T|NodeArray<T>) = T> (node: U, lexicalEnvironment: LexicalEnvironment): LexicalEnvironment {
	LEXICAL_ENVIRONMENT_MAP.set(node, lexicalEnvironment);
	return lexicalEnvironment;
}

/**
 * Creates a Lexical Environment
 * @returns {Promise<LexicalEnvironment>}
 */
export function createLexicalEnvironment (inputEnvironment: LexicalEnvironment["env"]): LexicalEnvironment {
	// Prepare a Realm and attach globals to the Lexical Environment. We do not want any part of the evaluation to mutate the actual global object.
	const {global: realmGlobal} = RealmImplementation.makeRootRealm();

	// Take all keys of the Realm
	const ecmaScriptMemberKeys = Object.keys(Object.getOwnPropertyDescriptors(realmGlobal));
	// Generate a Map of all those members
	const ecmaScriptMemberMap = Object.assign({}, ...ecmaScriptMemberKeys.map(key => ({[key]: realmGlobal[key]})));

	return {
		parentEnv: undefined,
		env: {
			...ecmaScriptMemberMap,
			...getNodeLexicalEnvironment(),
			...inputEnvironment
		}
	};
}