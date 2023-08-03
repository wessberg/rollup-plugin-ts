import prettier from "@prettier/sync";

export function formatCode(code: string, parser: "typescript" | "json" = "typescript"): string {
	return prettier.format(code, {parser, endOfLine: "lf"});
}
