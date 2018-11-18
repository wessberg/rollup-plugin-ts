import {Node} from "typescript";
import {SourceFileContext} from "../../shared/i-source-file-context";
import {Continuation} from "./continuation";

export const continuationMap: WeakMap<SourceFileContext, Continuation<Node>> = new WeakMap();