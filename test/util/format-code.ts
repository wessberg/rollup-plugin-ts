import {format} from "prettier";

export function formatCode(code: string): string {
	return format(code, {parser: "typescript"});
}
