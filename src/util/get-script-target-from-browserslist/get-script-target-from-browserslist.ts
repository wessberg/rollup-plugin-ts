import {ScriptTarget} from "typescript";
import {getAppropriateEcmaVersionForBrowserslist} from "@wessberg/browserslist-generator";

/**
 * Gets the ScriptTarget to use from the given Browserslist
 * @param {string[]} browserslist
 * @returns {ScriptTarget}
 */
export function getScriptTargetFromBrowserslist (browserslist: string[]): ScriptTarget {
	switch (getAppropriateEcmaVersionForBrowserslist(browserslist)) {
		case "es3":
			return ScriptTarget.ES3;
		case "es5":
			return ScriptTarget.ES5;
		case "es2015":
			return ScriptTarget.ES2015;
		case "es2016":
			return ScriptTarget.ES2016;
		case "es2017":
			return ScriptTarget.ES2017;
		case "es2018":
			return ScriptTarget.ES2018;
	}
}