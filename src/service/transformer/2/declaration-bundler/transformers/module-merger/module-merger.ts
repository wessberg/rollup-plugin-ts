import {visitNode} from "./visitor/visit-node";
import {TS} from "../../../../../../type/ts";
import {ChildVisitResult, IncludeSourceFileOptions, ModuleMergerVisitorOptions, PayloadMap, VisitResult} from "./module-merger-visitor-options";
import {pathsAreEqual} from "../../../../../../util/path/path-util";
import {DeclarationTransformer} from "../../declaration-bundler-options";
import {applyTransformers} from "../../util/apply-transformers";
import {isPrependableNode} from "./util/is-prependable-node";

export function moduleMerger(...transformers: DeclarationTransformer[]): DeclarationTransformer {
	return options => {
		const includedSourceFiles = new WeakSet<TS.SourceFile>();
		const prependNodeQueue = new Set<TS.Node>();

		const handleVisitedNode = (node: TS.Node): TS.VisitResult<TS.Node> => {
			if (isPrependableNode(node, options.typescript)) {
				const returnValue = [...prependNodeQueue, node];
				prependNodeQueue.clear();
				return returnValue;
			} else {
				return node;
			}
		};

		// Prepare some VisitorOptions
		const visitorOptions: Omit<ModuleMergerVisitorOptions<TS.Node>, "node"> = {
			...options,
			transformers,
			payload: undefined,

			childContinuation: <U extends TS.Node>(node: U, payload: PayloadMap[U["kind"]]): ChildVisitResult<U> => {
				visitorOptions.payload = payload;
				return options.typescript.visitEachChild(
					node,
					nextNode =>
						handleVisitedNode(
							visitNode({
								...visitorOptions,
								node: nextNode
							})
						),
					options.context
				) as ChildVisitResult<U>;
			},

			continuation: <U extends TS.Node>(node: U, payload: PayloadMap[U["kind"]]): VisitResult<U> => {
				visitorOptions.payload = payload;
				return handleVisitedNode(
					visitNode({
						...visitorOptions,
						node
					} as ModuleMergerVisitorOptions<U>)
				) as VisitResult<U>;
			},

			getMatchingSourceFile(moduleSpecifier: string, from: string): TS.SourceFile | undefined {
				const resolvedSourceFileName = options.resolver(moduleSpecifier, from);
				// If no SourceFile could be resolved
				if (resolvedSourceFileName == null) return undefined;

				for (const sourceFile of options.otherSourceFiles) {
					if (pathsAreEqual(sourceFile.fileName, resolvedSourceFileName)) {
						return sourceFile;
					}
				}

				return undefined;
			},

			prependNodes(...nodes: TS.Node[]): void {
				for (const node of nodes) prependNodeQueue.add(node);
			},

			includeSourceFile(
				sourceFile: TS.SourceFile,
				{allowDuplicate = false, ...otherOptions}: Partial<IncludeSourceFileOptions> = {}
			): Iterable<TS.Statement> {
				// Never include the same SourceFile twice
				if (includedSourceFiles.has(sourceFile) && !allowDuplicate) return [];
				includedSourceFiles.add(sourceFile);

				const transformedSourceFile = applyTransformers({
					visitorOptions: {
						...visitorOptions,
						...otherOptions,
						sourceFile
					},
					transformers
				});

				return transformedSourceFile.statements;
			}
		};

		return visitorOptions.childContinuation(options.sourceFile, undefined) as TS.SourceFile;
	};
}
