import {SourceFileBundlerVisitorOptions} from "../source-file-bundler/source-file-bundler-visitor-options";
import {TS} from "../../../../../type/ts";
import {TypeReferenceCollectorVisitorOptions} from "./type-reference-collector-visitor-options";
import {visitNode} from "./visitor/visit-node";

export function typeReferenceCollector(options: SourceFileBundlerVisitorOptions): TS.SourceFile {
	const {typescript} = options;
	const typeReferences = new Set<string>();
	options.sourceFileToTypeReferencesSet.set(options.sourceFile.fileName, typeReferences);

	// Prepare some VisitorOptions
	const visitorOptions: Omit<TypeReferenceCollectorVisitorOptions<TS.Node>, "node"> = {
		...options,
		importDeclarations: options.sourceFile.statements.filter(options.typescript.isImportDeclaration),

		addTypeReference(module: string): void {
			typeReferences.add(module);
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
