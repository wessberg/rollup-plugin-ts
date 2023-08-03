import path from "crosspath";
import fs from "fs";
import semver from "semver";
import avaTest, {type ExecutionContext} from "ava";
import type * as TS from "typescript";
import type {rollup} from "rollup";

function getNearestPackageJson(from = import.meta.url): Record<string, unknown> | undefined {
	// There may be a file protocol in from of the path
	const normalizedFrom = path.urlToFilename(from);
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

const pkg = getNearestPackageJson();

export interface ExecutionContextOptions {}

export interface TypeScriptExecutionContextOptions extends ExecutionContextOptions {
	typescript: typeof TS;
}

export interface RollupExecutionContextOptions extends TypeScriptExecutionContextOptions {
	rollup: typeof rollup;
	rollupVersion: string;
}

export type TypeScriptExtendedImplementation = (t: ExecutionContext, options: TypeScriptExecutionContextOptions) => void | Promise<void>;
export type RollupExtendedImplementation = (t: ExecutionContext, options: RollupExecutionContextOptions) => void | Promise<void>;

const {devDependencies} = pkg as {devDependencies: Record<string, string>};

// Map of all TypeScript versions parsed from package.json
const TS_OPTIONS_ENTRIES = new Map<string, TypeScriptExecutionContextOptions>();
// Map of all Rollup versions parsed from package.json
const ROLLUP_OPTIONS_ENTRIES = new Map<string, Omit<RollupExecutionContextOptions, keyof TypeScriptExecutionContextOptions>>();

const tsRangeRegex = /(npm:typescript@)?[\^~]*(.+)$/;
const rollupRangeRegex = /(npm:rollup@)?[\^~]*(.+)$/;
const tsFilter = process.env.TS_VERSION;
const rollupFilter = process.env.ROLLUP_VERSION;

for (const [specifier, range] of Object.entries(devDependencies)) {
	const tsMatch = range.match(tsRangeRegex);
	const rollupMatch = range.match(rollupRangeRegex);

	const tsMatchContext = tsMatch?.[1];
	const tsMatchVersion = tsMatch?.[2];

	const rollupMatchContext = rollupMatch?.[1];
	const rollupMatchVersion = rollupMatch?.[2];

	if (tsMatchVersion != null && (tsMatchContext === "npm:typescript@" || specifier === "typescript")) {
		if (tsFilter === undefined || (tsFilter.toUpperCase() === "CURRENT" && specifier === "typescript") || semver.satisfies(tsMatchVersion, tsFilter, {includePrerelease: true})) {
			TS_OPTIONS_ENTRIES.set(tsMatchVersion, {
				typescript: (await import(specifier)).default
			});
		}
	} else if (rollupMatchVersion != null && (rollupMatchContext === "npm:rollup@" || specifier === "rollup")) {
		if (
			rollupFilter === undefined ||
			(rollupFilter.toUpperCase() === "CURRENT" && specifier === "rollup") ||
			semver.satisfies(rollupMatchVersion, rollupFilter, {includePrerelease: true})
		) {
			ROLLUP_OPTIONS_ENTRIES.set(rollupMatchVersion, {
				rollup: (await import(specifier)).rollup,
				rollupVersion: rollupMatchVersion
			});
		}
	}
}

if (TS_OPTIONS_ENTRIES.size === 0) {
	throw new Error(`The TS_VERSION environment variable matches none of the available TypeScript versions.
Filter: ${process.env.TS_VERSION}
Available TypeScript versions: ${[...TS_OPTIONS_ENTRIES.keys()].join(", ")}`);
}

if (ROLLUP_OPTIONS_ENTRIES.size === 0) {
	throw new Error(`The ROLLUP_VERSION environment variable matches none of the available Rollup versions.
Filter: ${process.env.ROLLUP_VERSION}
Available Rollup versions: ${[...ROLLUP_OPTIONS_ENTRIES.keys()].join(", ")}`);
}

interface TestRunOptions {
	only: boolean;
	serial: boolean;
	skip: boolean;
}

export function tsTest(title: string, tsVersionGlob: string | undefined, impl: TypeScriptExtendedImplementation, runOptions?: Partial<TestRunOptions>) {
	const allOptions = [...TS_OPTIONS_ENTRIES.values()];
	const filteredOptions =
		tsVersionGlob == null || tsVersionGlob === "*"
			? allOptions
			: [...TS_OPTIONS_ENTRIES.entries()].filter(([version]) => semver.satisfies(version, tsVersionGlob, {includePrerelease: true})).map(([, options]) => options);

	for (const currentOptions of allOptions) {
		const matchesGlob = filteredOptions.includes(currentOptions);
		const fullTitle = `${title} (TypeScript v${currentOptions.typescript.version}${matchesGlob ? "" : " is not applicable"})`;

		const testHandler = async (t: ExecutionContext) => (matchesGlob ? impl(t, currentOptions) : t.pass());

		if (Boolean(runOptions?.only)) {
			avaTest.only(fullTitle, testHandler);
		} else if (Boolean(runOptions?.serial)) {
			avaTest.serial(fullTitle, testHandler);
		} else if (Boolean(runOptions?.skip)) {
			avaTest.skip(fullTitle, testHandler);
		} else {
			avaTest(fullTitle, testHandler);
		}
	}
}

tsTest.only = function (title: string, tsVersionGlob: string | undefined, impl: TypeScriptExtendedImplementation) {
	return tsTest(title, tsVersionGlob, impl, {only: true});
};

tsTest.serial = function (title: string, tsVersionGlob: string | undefined, impl: TypeScriptExtendedImplementation) {
	return tsTest(title, tsVersionGlob, impl, {serial: true});
};

tsTest.skip = function (title: string, tsVersionGlob: string | undefined, impl: TypeScriptExtendedImplementation) {
	return tsTest(title, tsVersionGlob, impl, {skip: true});
};

interface RollupTestVersionGlobs {
	ts: string;
	rollup: string;
}

export function test(title: string, versionGlobs: Partial<RollupTestVersionGlobs> | "*" | undefined, impl: RollupExtendedImplementation, runOptions?: Partial<TestRunOptions>) {
	const allTsOptions = [...TS_OPTIONS_ENTRIES.values()];
	const allRollupOptions = [...ROLLUP_OPTIONS_ENTRIES.values()];

	const tsVersionGlob = versionGlobs === "*" || versionGlobs?.ts === undefined ? "*" : versionGlobs.ts;
	const rollupVersionGlob = versionGlobs === "*" || versionGlobs?.rollup === undefined ? "*" : versionGlobs.rollup;

	const filteredTsOptions =
		tsVersionGlob === "*"
			? allTsOptions
			: [...TS_OPTIONS_ENTRIES.entries()].filter(([version]) => semver.satisfies(version, tsVersionGlob, {includePrerelease: true})).map(([, options]) => options);

	const filteredRollupOptions =
		rollupVersionGlob === "*"
			? allRollupOptions
			: [...ROLLUP_OPTIONS_ENTRIES.entries()].filter(([version]) => semver.satisfies(version, rollupVersionGlob, {includePrerelease: true})).map(([, options]) => options);

	for (const currentRollupOptions of allRollupOptions) {
		const matchesRollupGlob = filteredRollupOptions.includes(currentRollupOptions);
		for (const currentTypescriptOptions of allTsOptions) {
			const matchesTsGlob = filteredTsOptions.includes(currentTypescriptOptions);

			const fullTitle = `${title} (TypeScript v${currentTypescriptOptions.typescript.version}${matchesTsGlob ? "" : " is not applicable"}, Rollup v${
				currentRollupOptions.rollupVersion
			}${matchesRollupGlob ? "" : " is not applicable"})`;

			const testHandler = async (t: ExecutionContext) => (matchesTsGlob && matchesRollupGlob ? impl(t, {...currentRollupOptions, ...currentTypescriptOptions}) : t.pass());

			if (Boolean(runOptions?.only)) {
				avaTest.only(fullTitle, testHandler);
			} else if (Boolean(runOptions?.serial)) {
				avaTest.serial(fullTitle, testHandler);
			} else if (Boolean(runOptions?.skip)) {
				avaTest.skip(fullTitle, testHandler);
			} else {
				avaTest(fullTitle, testHandler);
			}
		}
	}
}

test.only = function (title: string, versionGlobs: Partial<RollupTestVersionGlobs> | "*" | undefined, impl: RollupExtendedImplementation) {
	return test(title, versionGlobs, impl, {only: true});
};

test.serial = function (title: string, versionGlobs: Partial<RollupTestVersionGlobs> | "*" | undefined, impl: RollupExtendedImplementation) {
	return test(title, versionGlobs, impl, {serial: true});
};

test.skip = function (title: string, versionGlobs: Partial<RollupTestVersionGlobs> | "*" | undefined, impl: RollupExtendedImplementation) {
	return test(title, versionGlobs, impl, {skip: true});
};
