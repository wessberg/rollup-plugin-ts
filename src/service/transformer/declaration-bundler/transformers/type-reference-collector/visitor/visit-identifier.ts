import {TS} from "../../../../../../type/ts";
import {TypeReferenceCollectorVisitorOptions} from "../type-reference-collector-visitor-options";
import {getTypeReferenceModuleFromNode} from "../../../util/get-type-reference-module-from-node";

export function visitIdentifier(options: TypeReferenceCollectorVisitorOptions<TS.Identifier>): void {
	const {node, addTypeReference} = options;

	const typeReferenceModule = getTypeReferenceModuleFromNode({...options, node});
	if (typeReferenceModule != null) {
		addTypeReference(typeReferenceModule);
	}
}
