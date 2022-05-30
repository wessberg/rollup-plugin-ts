import path from "crosspath";
import {TestFileRecord} from "./test-file.js";
import {createFsFromVolume, Volume} from "memfs";
import {FileSystem} from "../../src/util/file-system/file-system.js";

export function createVirtualFileSystem(files: TestFileRecord[]): FileSystem {
	const vol = new Volume();
	for (const file of files) {
		vol.mkdirSync(path.native.normalize(path.dirname(file.fileName)), {recursive: true});
		vol.writeFileSync(path.native.normalize(file.fileName), file.text);
	}

	return createFsFromVolume(vol) as unknown as FileSystem;
}
