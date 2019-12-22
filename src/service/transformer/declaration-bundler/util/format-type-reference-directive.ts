export function formatTypeReferenceDirective(fileName: string): string {
	return `/// <reference types="${fileName}" />`;
}
