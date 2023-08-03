import {getAppropriateEcmaVersionForBrowserslist} from "browserslist-generator";
import type {TS} from "../../type/ts.js";

/**
 * Gets the ScriptTarget to use from the given Browserslist
 */
export function getScriptTargetFromBrowserslist(browserslist: string[], typescript: typeof TS): TS.ScriptTarget {
	switch (getAppropriateEcmaVersionForBrowserslist(browserslist)) {
		case "es3":
			return typescript.ScriptTarget.ES3;
		case "es5":
			return typescript.ScriptTarget.ES5;
		case "es2015":
			return typescript.ScriptTarget.ES2015;
		// Support older TypeScript versions that may not supported ES2016 as a ScriptTarget with nullish coalescing
		case "es2016":
			return typescript.ScriptTarget.ES2016 ?? typescript.ScriptTarget.ES2015;
		// Support older TypeScript versions that may not supported ES2017 as a ScriptTarget with nullish coalescing
		case "es2017":
			return typescript.ScriptTarget.ES2017 ?? typescript.ScriptTarget.ES2016 ?? typescript.ScriptTarget.ES2015;
		// Support older TypeScript versions that may not supported ES2018 as a ScriptTarget with nullish coalescing
		case "es2018":
			return typescript.ScriptTarget.ES2018 ?? typescript.ScriptTarget.ES2017 ?? typescript.ScriptTarget.ES2016 ?? typescript.ScriptTarget.ES2015;
		// Support older TypeScript versions that may not supported ES2019 as a ScriptTarget with nullish coalescing
		case "es2019":
			return typescript.ScriptTarget.ES2019 ?? typescript.ScriptTarget.ES2018 ?? typescript.ScriptTarget.ES2017 ?? typescript.ScriptTarget.ES2016 ?? typescript.ScriptTarget.ES2015;
		// Support older TypeScript versions that may not supported ES2020 as a ScriptTarget with nullish coalescing
		case "es2020":
			return (
				typescript.ScriptTarget.ES2020 ??
				typescript.ScriptTarget.ES2019 ??
				typescript.ScriptTarget.ES2018 ??
				typescript.ScriptTarget.ES2017 ??
				typescript.ScriptTarget.ES2016 ??
				typescript.ScriptTarget.ES2015
			);
		// Support older TypeScript versions that may not supported ES2021 as a ScriptTarget with nullish coalescing
		case "es2021":
			return (
				typescript.ScriptTarget.ES2021 ??
				typescript.ScriptTarget.ES2020 ??
				typescript.ScriptTarget.ES2019 ??
				typescript.ScriptTarget.ES2018 ??
				typescript.ScriptTarget.ES2017 ??
				typescript.ScriptTarget.ES2016 ??
				typescript.ScriptTarget.ES2015
			);
		case "es2022":
		case "es2023":
			return (
				typescript.ScriptTarget.ES2022 ??
				typescript.ScriptTarget.ES2021 ??
				typescript.ScriptTarget.ES2020 ??
				typescript.ScriptTarget.ES2019 ??
				typescript.ScriptTarget.ES2018 ??
				typescript.ScriptTarget.ES2017 ??
				typescript.ScriptTarget.ES2016 ??
				typescript.ScriptTarget.ES2015
			);
	}
}

/**
 * Gets the EcmaVersion that represents the given ScriptTarget
 */
export function getEcmaVersionForScriptTarget(scriptTarget: TS.ScriptTarget, typescript: typeof TS): ReturnType<typeof getAppropriateEcmaVersionForBrowserslist> {
	switch (scriptTarget) {
		case typescript.ScriptTarget.ES3:
			return "es3";
		case typescript.ScriptTarget.ES5:
			return "es5";
		case typescript.ScriptTarget.ES2015:
			return "es2015";
		case typescript.ScriptTarget.ES2016:
			return "es2016";
		case typescript.ScriptTarget.ES2017:
			return "es2017";
		case typescript.ScriptTarget.ES2018:
			return "es2018";
		case typescript.ScriptTarget.ES2019:
			return "es2019";
		case typescript.ScriptTarget.ES2020:
			return "es2020";
		case typescript.ScriptTarget.ES2021:
			return "es2021";
		case typescript.ScriptTarget.ES2022:
			return "es2022";
		case typescript.ScriptTarget.ESNext:
		case typescript.ScriptTarget.Latest:
		case typescript.ScriptTarget.JSON:
			return "es2023";
	}
}
