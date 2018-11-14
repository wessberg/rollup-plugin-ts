import {Node, VisitResult} from "typescript";

export type Continuation<T extends Node> = (continuationNode: T) => VisitResult<T>;