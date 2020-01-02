import {FileSystem} from "../../util/file-system/file-system";

export interface ModuleResolutionHostOptions {
	fileSystem: FileSystem;
	cwd: string;
}
