import {CompatFactory} from "../transformers/source-file-bundler/source-file-bundler-visitor-options";
import {TS} from "../../../../type/ts";

export function isNodeFactory(compatFactory: CompatFactory): compatFactory is TS.NodeFactory {
	return !("updateSourceFileNode" in compatFactory);
}
