import {format} from "prettier";

export function formatCode(code: string, parser: "typescript" | "json" = "typescript"): string {
	return format(code, {parser});
}
