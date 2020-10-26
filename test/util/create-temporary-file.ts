import {dirname, nativeDirname, nativeJoin, normalize} from "../../src/util/path/path-util";
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
	const path = nativeJoin(tmpdir(), generateRandomHash({length: 20, key: String(Math.floor(Math.random() * 10000))}), `/${fileName}`);

	if (!existsSync(nativeDirname(path))) {
		mkdirSync(nativeDirname(path));
	}

	writeFileSync(path, formatCode(content, parser));
	return {
		cleanup: () => unlinkSync(path),
		path: normalize(path),
		dir: dirname(path)
	};
}
