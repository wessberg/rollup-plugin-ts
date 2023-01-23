import type {TS} from "../../../../../../type/ts.js";
import type {TypeReferenceCollectorVisitorOptions} from "../type-reference-collector-visitor-options.js";
import {getTypeReferenceModuleFromNode} from "../../../util/get-type-reference-module-from-node.js";

export function visitIdentifier(options: TypeReferenceCollectorVisitorOptions<TS.Identifier>): void {
	const {node, addTypeReference} = options;

	const typeReferenceModule = getTypeReferenceModuleFromNode({...options, node});
	if (typeReferenceModule != null) {
		addTypeReference(typeReferenceModule);
	}
}
