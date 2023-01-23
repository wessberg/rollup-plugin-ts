import type fsModule from "fs";

export type ReadonlyFileSystem = Pick<typeof fsModule, "statSync" | "lstatSync" | "readFileSync" | "readdirSync" | "realpathSync">;
export type FileSystem = ReadonlyFileSystem & Pick<typeof fsModule, "writeFileSync" | "mkdirSync" | "unlinkSync">;
