import {TS} from "../../../../type/ts.js";
import {isRootLevelNode} from "../transformers/module-merger/util/is-root-level-node.js";

export interface NodePlacementQueue {
	prependNodes(...nodes: TS.Node[]): void;
	appendNodes(...nodes: TS.Node[]): void;
	wrapVisitResult<T extends TS.Node>(node: TS.VisitResult<T>): TS.VisitResult<TS.Node>;
	flush(): readonly [readonly TS.Node[], readonly TS.Node[]];
}

export interface GetNodePlacementQueueOptions {
	typescript: typeof TS;
}

export function getNodePlacementQueue({typescript}: GetNodePlacementQueueOptions): NodePlacementQueue {
	const prependNodeQueue = new Set<TS.Node>();
	const appendNodeQueue = new Set<TS.Node>();
	const flush = (): readonly [readonly TS.Node[], readonly TS.Node[]] => {
		const returnValue = [[...prependNodeQueue], [...appendNodeQueue]] as const;
		prependNodeQueue.clear();
		appendNodeQueue.clear();
		return returnValue;
	};

	return {
		flush,
		prependNodes(...nodes: TS.Node[]): void {
			for (const node of nodes) prependNodeQueue.add(node);
		},
		appendNodes(...nodes: TS.Node[]): void {
			for (const node of nodes) appendNodeQueue.add(node);
		},
		wrapVisitResult<T extends TS.Node>(node: TS.VisitResult<T>): TS.VisitResult<TS.Node> {
			if (isRootLevelNode(node, typescript) || (Array.isArray(node) && node.some(n => isRootLevelNode(n, typescript)))) {
				const [prependNodes, appendNodes] = flush();
				return [...prependNodes, ...(Array.isArray(node) ? node : [node]), ...appendNodes];
			} else {
				return node;
			}
		}
	};
}
