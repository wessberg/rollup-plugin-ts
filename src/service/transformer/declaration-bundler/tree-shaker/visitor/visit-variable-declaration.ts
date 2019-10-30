import {VariableDeclaration} from "typescript";
import {TreeShakerVisitorOptions} from "../tree-shaker-visitor-options";

export function visitVariableDeclaration({node, continuation}: TreeShakerVisitorOptions<VariableDeclaration>): VariableDeclaration | undefined {
	const result = continuation(node);
	return result == null || result.name == null ? undefined : result;
}
