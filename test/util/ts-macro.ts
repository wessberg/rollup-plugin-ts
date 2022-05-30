import semver from "semver";
import path from "crosspath";
import fs from "fs";
import type {ExecutionContext, OneOrMoreMacros, Macro} from "ava";
import type {TS} from "../../src/type/ts.js";

function getNearestPackageJson(from = import.meta.url): Record<string, unknown> | undefined {
	// There may be a file protocol in from of the path
	const normalizedFrom = from.replace(/file:\/{2,3}/, "");
	const currentDir = path.dirname(normalizedFrom);

	const pkgPath = path.join(currentDir, "package.json");
	if (fs.existsSync(pkgPath)) {
		return JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
	} else if (currentDir !== normalizedFrom) {
		return getNearestPackageJson(currentDir);
	} else {
		return undefined;
	}
}
const pkg = getNearestPackageJson(import.meta.url);

// ava macros
export interface ExtendedImplementationArgumentOptions {
	typescript: typeof TS;
}
export type ExtendedImplementation = (t: ExecutionContext, options: ExtendedImplementationArgumentOptions) => void | Promise<void>;
function makeTypeScriptMacro(version: string, specifier: string) {
	const macro: Macro<[ExtendedImplementation]> = async (t, impl) => {
		let typescript = await import(specifier);
		if ("default" in typescript) {
			typescript = typescript.default;
		}
		return impl(t, {typescript});
	};
	macro.title = (provided = "") => `${provided} (TypeScript v${version})`;

	return macro;
}
const noMatchingVersionMacro: Macro<[ExtendedImplementation]> = t => {
	t.pass("No matching TypeScript versions");
};
noMatchingVersionMacro.title = (provided = "") => `${provided} (No matching TypeScript versions)`;

const {devDependencies} = pkg as {devDependencies: Record<string, string>};

// Set of all TypeScript versions parsed from package.json
const availableTsVersions = new Set<string>();
// Map of TypeScript version to ava macro
const macros = new Map<string, Macro<[ExtendedImplementation]>>();

const tsRangeRegex = /(npm:typescript@)?[\^~]*(.+)$/;
const filter = process.env.TS_VERSION;

for (const [specifier, range] of Object.entries(devDependencies)) {
	const match = range.match(tsRangeRegex);
	if (match !== null) {
		const [, context, version] = match;
		if (context === "npm:typescript@" || specifier === "typescript") {
			availableTsVersions.add(version);
			if (filter === undefined || (filter.toUpperCase() === "CURRENT" && specifier === "typescript") || semver.satisfies(version, filter, {includePrerelease: true})) {
				macros.set(version, makeTypeScriptMacro(version, specifier));
			}
		}
	}
}

if (macros.size === 0) {
	throw new Error(`The TS_VERSION environment variable matches none of the available TypeScript versions.
Filter: ${process.env.TS_VERSION}
Available TypeScript versions: ${[...availableTsVersions].join(", ")}`);
}

export function withTypeScriptVersions(extraFilter: string): OneOrMoreMacros<[ExtendedImplementation], unknown> {
	const filteredMacros = [...macros.entries()].filter(([version]) => semver.satisfies(version, extraFilter, {includePrerelease: true})).map(([, macro]) => macro);

	if (filteredMacros.length === 0) {
		filteredMacros.push(noMatchingVersionMacro);
	}

	return filteredMacros as OneOrMoreMacros<[ExtendedImplementation], unknown>;
}

export const withTypeScript = withTypeScriptVersions("*");
