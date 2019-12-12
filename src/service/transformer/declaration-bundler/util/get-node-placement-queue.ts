import {TS} from "../../../../type/ts";
import {isRootLevelNode} from "../transformers/module-merger/util/is-root-level-node";

export interface NodePlacementQueue {
	prependNodes(...nodes: TS.Node[]): void;
	appendNodes(...nodes: TS.Node[]): void;
	wrapVisitResult<T extends TS.Node>(node: TS.VisitResult<T>): TS.VisitResult<TS.Node>;
}

export interface GetNodePlacementQueueOptions {
	typescript: typeof TS;
}

export function getNodePlacementQueue({typescript}: GetNodePlacementQueueOptions): NodePlacementQueue {
	const prependNodeQueue = new Set<TS.Node>();
	const appendNodeQueue = new Set<TS.Node>();

	return {
		prependNodes(...nodes: TS.Node[]): void {
			for (const node of nodes) prependNodeQueue.add(node);
		},
		appendNodes(...nodes: TS.Node[]): void {
			for (const node of nodes) appendNodeQueue.add(node);
		},
		wrapVisitResult<T extends TS.Node>(node: TS.VisitResult<T>): TS.VisitResult<TS.Node> {
			if (isRootLevelNode(node, typescript) || (Array.isArray(node) && node.some(n => isRootLevelNode(n, typescript)))) {
				const returnValue = [...prependNodeQueue, ...(Array.isArray(node) ? node : [node]), ...appendNodeQueue];
				prependNodeQueue.clear();
				appendNodeQueue.clear();
				return returnValue;
			} else {
				return node;
			}
		}
	};
}
