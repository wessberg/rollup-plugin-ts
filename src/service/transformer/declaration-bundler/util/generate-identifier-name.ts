import {stripKnownExtension} from "../../../../util/path/path-util";
import {camelCase} from "@wessberg/stringutil";
import path from "crosspath";

export type GenerateIdentifierNameHint = "class" | "namespace" | "function";

function generateHintSuffix(hint: GenerateIdentifierNameHint): string {
	switch (hint) {
		case "class":
			return "Class";
		case "function":
			return "Func";
		case "namespace":
			return "NS";
	}
}

/**
 * Generates an identifier based on the given module name
 */
export function generateIdentifierName(module: string, hint: GenerateIdentifierNameHint): string {
	return `${camelCase(stripKnownExtension(path.basename(module)))}${generateHintSuffix(hint)}`;
}
