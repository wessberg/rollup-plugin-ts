import {ScriptTarget} from "typescript";
import {getAppropriateEcmaVersionForBrowserslist} from "@wessberg/browserslist-generator";

/**
 * Gets the ScriptTarget to use from the given Browserslist
 * @param {string[]} browserslist
 * @returns {ScriptTarget}
 */
export function getScriptTargetFromBrowserslist(browserslist: string[]): ScriptTarget {
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

/**
 * Gets the EcmaVersion that represents the given ScriptTarget
 * @param {ScriptTarget} scriptTarget
 * @returns {string}
 */
export function getEcmaVersionForScriptTarget(scriptTarget: ScriptTarget): "es3" | "es5" | "es2015" | "es2016" | "es2017" | "es2018" {
	switch (scriptTarget) {
		case ScriptTarget.ES3:
			return "es3";
		case ScriptTarget.ES5:
			return "es5";
		case ScriptTarget.ES2015:
			return "es2015";
		case ScriptTarget.ES2016:
			return "es2016";
		case ScriptTarget.ES2017:
			return "es2017";
		case ScriptTarget.ES2018:
		case ScriptTarget.ESNext:
		case ScriptTarget.JSON:
			return "es2018";
	}
}
