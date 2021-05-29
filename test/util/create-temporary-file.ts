import path from "crosspath";
import {unlinkSync, existsSync, writeFileSync, mkdirSync} from "fs";
import {tmpdir} from "os";
import {formatCode} from "./format-code";
import {generateRandomHash} from "../../src/util/hash/generate-random-hash";

export interface CreateTemporaryConfigFileResult {
	cleanup(): void;
	path: string;
	dir: string;
}

export function createTemporaryFile(fileName: string, content: string, parser?: "typescript" | "json"): CreateTemporaryConfigFileResult {
	const p = path.native.join(tmpdir(), generateRandomHash({length: 20, key: String(Math.floor(Math.random() * 10000))}), `/${fileName}`);

	if (!existsSync(path.native.dirname(p))) {
		mkdirSync(path.native.dirname(p));
	}

	writeFileSync(p, formatCode(content, parser));
	return {
		cleanup: () => unlinkSync(p),
		path: path.normalize(p),
		dir: path.dirname(p)
	};
}

export function areTempFilesEqual(a: string | undefined, b: string | undefined): boolean {
	if (a == null && b == null) return true;
	if (a == null || b == null) return false;

	let normalizedA = path.normalize(a);
	let normalizedB = path.normalize(b);

	// This happens sometimes on Github actions
	if (normalizedA.startsWith("/private")) normalizedA = normalizedA.slice("/private".length);
	if (normalizedB.startsWith("/private")) normalizedB = normalizedB.slice("/private".length);

	return normalizedA === normalizedB;
}
