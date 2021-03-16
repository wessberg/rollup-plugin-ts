import {readFileSync} from "fs";
import {resolve} from "path";
import {satisfies} from "semver";

import type {ExecutionContext, OneOrMoreMacros, Macro} from "ava";
import type {TS} from "../../src/type/ts";

// ava macros
export interface ExtendedImplementationArgumentOptions {
	typescript: typeof TS;
	typescriptModuleSpecifier: string;
}
export type ExtendedImplementation = (t: ExecutionContext, options: ExtendedImplementationArgumentOptions) => void | Promise<void>;
function makeTypeScriptMacro(version: string, specifier: string) {
	const macro: Macro<[ExtendedImplementation]> = async (t, impl) => impl(t, {typescript: await import(specifier), typescriptModuleSpecifier: specifier});
	macro.title = (provided = "") => `${provided} (TypeScript v${version})`;

	return macro;
}
const noMatchingVersionMacro: Macro<[ExtendedImplementation]> = t => {
	t.pass("No matching TypeScript versions");
};
noMatchingVersionMacro.title = (provided = "") => `${provided} (No matching TypeScript versions)`;

// Read package.json
const pkg = JSON.parse(readFileSync(resolve(__dirname, "../../package.json"), "utf8"));
const {devDependencies} = pkg as {devDependencies: Record<string, string>};

// Set of all TypeScript versions parsed from package.json
const availableTsVersions = new Set<string>();
// Map of TypeScript version to ava macro
const macros = new Map<string, Macro<[ExtendedImplementation]>>();

const tsRangeRegex = /^npm:typescript@(.+)$/;
const filter = process.env.TS_VERSION;

for (const [specifier, range] of Object.entries(devDependencies)) {
	const match = range.match(tsRangeRegex);
	if (match !== null) {
		availableTsVersions.add(match[1]);
		if (filter === undefined || satisfies(match[1], filter, {includePrerelease: true})) {
			macros.set(match[1], makeTypeScriptMacro(match[1], specifier));
		}
	}
}
availableTsVersions.add(devDependencies.typescript);
if (filter === undefined || filter.toUpperCase() === "CURRENT" || satisfies(devDependencies.typescript, filter, {includePrerelease: true})) {
	macros.set(devDependencies.typescript, makeTypeScriptMacro(devDependencies.typescript, "typescript"));
}

if (macros.size === 0) {
	throw new Error(`The TS_VERSION environment variable matches none of the available TypeScript versions.
Filter: ${process.env.TS_VERSION}
Available TypeScript versions: ${[...availableTsVersions].join(", ")}`);
}

export function withTypeScriptVersions(extraFilter: string): OneOrMoreMacros<[ExtendedImplementation], unknown> {
	const filteredMacros = [...macros.entries()].filter(([version]) => satisfies(version, extraFilter, {includePrerelease: true})).map(([, macro]) => macro);

	if (filteredMacros.length === 0) {
		filteredMacros.push(noMatchingVersionMacro);
	}

	return filteredMacros as OneOrMoreMacros<[ExtendedImplementation], unknown>;
}

export default withTypeScriptVersions("*");
