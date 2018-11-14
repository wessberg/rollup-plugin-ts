import {Node} from "typescript";
import {ISourceFileContext} from "../../i-source-file-context";
import {Continuation} from "./continuation";

export const continuationMap: WeakMap<ISourceFileContext, Continuation<Node>> = new WeakMap();