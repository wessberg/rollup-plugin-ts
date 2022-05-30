import {VisitorOptions} from "./visitor-options.js";
import {TS} from "../../../../../../type/ts.js";

export interface ReferenceVisitorOptions<T extends TS.Node = TS.Node> extends VisitorOptions<T> {
	continuation<U extends TS.Node>(node: U): string[];
	childContinuation<U extends TS.Node>(node: U): string[];
	markIdentifiersAsReferenced(fromNode: TS.Node, ...identifiers: string[]): void;
}
