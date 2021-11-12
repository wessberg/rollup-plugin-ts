import {TS} from "../../../../type/ts";

/**
 * Returns true if the given Node is a Statement
 * Uses an internal non-exposed Typescript helper to decide whether or not the Node is a Statement
 */
export function isStatement(node: TS.Node, typescript: typeof TS): node is TS.Statement {
	return (typescript as unknown as {isStatementButNotDeclaration(node: TS.Node): boolean}).isStatementButNotDeclaration(node);
}
