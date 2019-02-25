import {KeywordTypeNode} from "typescript";
import {ReferenceVisitorOptions} from "../../reference-visitor-options";

/**
 * Visits the given KeywordTypeNode.
 * @param {KeywordTypeNode} _currentNode
 * @param {VisitorOptions} _options
 * @returns {boolean}
 */
export function checkKeywordTypeNode(_currentNode: KeywordTypeNode, _options: ReferenceVisitorOptions): boolean {
	return false;
}
