import {forEachChild, isExportAssignment, isExportDeclaration, isExportSpecifier, isIdentifier, isModuleDeclaration, Node} from "typescript";
import {IsReferencedOptions} from "./is-referenced-options";
import {nodeContainsChild} from "../../util/node-contains-child";
import {getIdentifiersForNode} from "../../util/get-identifiers-for-node";
import {hasExportModifier} from "../../../declaration-bundler/util/modifier/modifier-util";
import {ReferenceVisitorOptions} from "./reference-visitor-options";
import {checkIdentifier} from "./visitor/check-identifier";
import {isAmbientModuleRootLevelNode} from "../../util/is-ambient-module-root-level-node";

/**
 * Visits the given node. Returns true if it references the node to check for references, and false otherwise
 * @param {Node} currentNode
 * @param {ReferenceVisitorOptions} options
 * @return {boolean}
 */
function checkNode(currentNode: Node, options: ReferenceVisitorOptions): boolean {
	if (options.node === currentNode || nodeContainsChild(options.node, currentNode)) return false;

	if (isIdentifier(currentNode)) return checkIdentifier(currentNode, options);
	else return options.continuation(currentNode);
}

/**
 * Visits the given node. Returns true if it references the node to check for references, and false otherwise
 * @param {Node} currentNode
 * @param {VisitorOptions} options
 * @return {Node?}
 */
function visitNode(currentNode: Node, options: ReferenceVisitorOptions): void {
	if (options.node === currentNode || nodeContainsChild(options.node, currentNode)) return;

	if (isAmbientModuleRootLevelNode(currentNode) && options.continuation(currentNode)) {
		options.referencingNodes.add(currentNode);
	}
}

/**
 * Returns true if the given Node is referenced within the given options
 * @param {IsReferencedOptions} opts
 * @return {Node[]}
 */
export function isReferenced<T extends Node>({seenNodes = new Set(), ...options}: IsReferencedOptions<T>): boolean {
	// Exports are always referenced and should never be removed
	if (
		isExportDeclaration(options.node) ||
		isExportSpecifier(options.node) ||
		isExportAssignment(options.node) ||
		hasExportModifier(options.node) ||
		isModuleDeclaration(options.node)
	) {
		return true;
	}

	// If it has been computed previously, use the cached result
	if (options.cache.hasReferencesCache.has(options.node)) {
		return options.cache.hasReferencesCache.get(options.node)!;
	}

	// Assume that the node is referenced if the received node has been visited before in the recursive stack
	if (seenNodes.has(options.node)) {
		return true;
	} else {
		// Otherwise, add the node to the Set of seen nodes
		seenNodes.add(options.node);
	}

	// Collect all nodes that references the given node
	const referencingNodes = collectReferences(options);

	// Compute the result
	const result =
		referencingNodes.length > 0 && referencingNodes.some(referencingNode => isReferenced({...options, seenNodes, node: referencingNode}));

	// Cache the result
	options.cache.hasReferencesCache.set(options.node, result);
	return result;
}

function collectReferences<T extends Node>(options: IsReferencedOptions<T>): Node[] {
	const visitorOptions = {
		...options,
		referencingNodes: new Set<Node>(),
		identifiers: getIdentifiersForNode(options.node, options.cache),
		continuation: (node: Node): boolean => {
			const result = forEachChild<boolean>(node, nextNode => checkNode(nextNode, visitorOptions));
			return result === true;
		}
	};

	const sourceFile = options.node.getSourceFile();
	forEachChild<void>(sourceFile, node => visitNode(node, visitorOptions));
	return [...visitorOptions.referencingNodes];
}
