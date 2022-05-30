import {SourceFileBundlerVisitorOptions} from "../source-file-bundler/source-file-bundler-visitor-options.js";
import {TS} from "../../../../../type/ts.js";
import {TypeReferenceCollectorVisitorOptions} from "./type-reference-collector-visitor-options.js";
import {visitNode} from "./visitor/visit-node.js";
import {TypeReference} from "../../util/get-type-reference-module-from-file-name.js";

export function typeReferenceCollector(options: SourceFileBundlerVisitorOptions): TS.SourceFile {
	const {typescript} = options;
	const typeReferences = new Set<TypeReference>();
	options.sourceFileToTypeReferencesSet.set(options.sourceFile.fileName, typeReferences);

	// Prepare some VisitorOptions
	const visitorOptions: Omit<TypeReferenceCollectorVisitorOptions<TS.Node>, "node"> = {
		...options,
		importDeclarations: options.sourceFile.statements.filter(options.typescript.isImportDeclaration),

		addTypeReference(typeReference: TypeReference): void {
			typeReferences.add(typeReference);
		},

		childContinuation: <U extends TS.Node>(node: U): void =>
			typescript.forEachChild(node, nextNode => {
				visitNode({
					...visitorOptions,
					node: nextNode
				});
			}),

		continuation: <U extends TS.Node>(node: U): void => {
			visitNode({
				...visitorOptions,
				node
			});
		}
	};

	typescript.forEachChild(options.sourceFile, nextNode => {
		visitorOptions.continuation(nextNode);
	});
	return options.sourceFile;
}
