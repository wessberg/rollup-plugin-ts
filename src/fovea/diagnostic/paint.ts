import chalk from "chalk";

/**
 * Paints something that represents a selector
 * @param {string} selector
 * @returns {string}
 */
export function paintSelector (selector: string): string {
	return chalk.blueBright(selector);
}

/**
 * Paints something that represents a decorator
 * @param {string} decorator
 * @returns {string}
 */
export function paintDecorator (decorator: string): string {
	return chalk.blueBright(decorator);
}

/**
 * Paints something that represents a function
 * @param {string} func
 * @returns {string}
 */
export function paintFunction (func: string): string {
	return chalk.yellowBright(func);
}

/**
 * Paints something that represents a host such as a component or a custom attribute
 * @param {string} host
 * @returns {string}
 */
export function paintHost (host: string): string {
	return chalk.magenta(host);
}

/**
 * Paints something that represents some metadata, such as a file path
 * @param {string} metadata
 * @returns {string}
 */
export function paintMetadata (metadata: string): string {
	return chalk.gray(metadata);
}

/**
 * Paints something that represents an error
 * @param {string} error
 * @returns {string}
 */
export function paintError (error: string): string {
	return chalk.red(error);
}

/**
 * Paints something that represents a warning
 * @param {string} warning
 * @returns {string}
 */
export function paintWarning (warning: string): string {
	return chalk.yellow(warning);
}

/**
 * Paints something that represents a border
 * @param {string} border
 * @returns {string}
 */
export function paintBorder (border: string): string {
	return chalk.gray(border);
}

/**
 * Paints something that represents a successful action
 * @param {string} content
 * @returns {string}
 */
export function paintSuccess (content: string): string {
	return chalk.green(content);
}

/**
 * Paints something that represents a number
 * @param {string | number} num
 * @returns {string}
 */
export function paintNumber (num: string|number): string {
	return chalk.yellow.bold(`${num}`);
}