import {CachedWorker, CachedWorkerOptions} from "./cached-worker";
import {TS} from "../../type/ts";
import {FileSystem} from "../../util/file-system/file-system";

export interface CachedFsWorkerOptions extends CachedWorkerOptions {
	fs: TS.System | FileSystem;
}

export class CachedFs extends CachedWorker<CachedFsWorkerOptions> {
	readFile(file: string): string | undefined {
		return this.work(file, () => {
			if ("readFileSync" in this.options.fs) {
				try {
					return this.options.fs.readFileSync(file, "utf8");
				} catch {
					return undefined;
				}
			} else {
				return this.options.fs.readFile(file);
			}
		});
	}
}
