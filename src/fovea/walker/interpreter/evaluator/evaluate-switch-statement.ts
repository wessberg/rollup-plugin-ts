import {IEvaluatorOptions} from "./i-evaluator-options";
import {CaseClause, DefaultClause, isBreakStatement, isCaseClause, isDefaultClause, isReturnStatement, SwitchStatement} from "typescript";
import {Literal} from "../literal/literal";
import {LexicalEnvironment} from "../lexical-environment/lexical-environment";
import {cloneLexicalEnvironment} from "../lexical-environment/clone-lexical-environment";
import {isNodeArray} from "../../util/node-array/is-node-array";

/**
 * Evaluates, or attempts to evaluate, a SwitchStatement
 * @param {IEvaluatorOptions<SwitchStatement>} options
 * @returns {Literal}
 */
export function evaluateSwitchStatement ({node, environment, continuation, continuationFactory}: IEvaluatorOptions<SwitchStatement>): Literal {
	// Take the result of the switch expression
	const switchExpression = continuation.run(node.expression, environment);

	// Prepare a lexical environment for the CaseBlock
	const caseBlockLexicalEnvironment: LexicalEnvironment = cloneLexicalEnvironment(environment);

	// Prepare a local continuation function
	const localContinuation = continuationFactory.create(localNode => !isNodeArray(localNode) && (isReturnStatement(localNode) || isBreakStatement(localNode)));

	let value: Literal;

	const caseClauses = <CaseClause[]>node.caseBlock.clauses.filter(clause => isCaseClause(clause));
	const defaultClause = <DefaultClause|undefined>node.caseBlock.clauses.find(clause => isDefaultClause(clause));

	for (const clause of caseClauses) {
		const clauseExpression = continuation.run(clause.expression, caseBlockLexicalEnvironment);
		if (clauseExpression !== switchExpression) continue;

		value = localContinuation.run(clause.statements, caseBlockLexicalEnvironment);
		if (localContinuation.isTerminated) return value;
	}

	if (defaultClause == null) return value;
	return localContinuation.run(defaultClause.statements, caseBlockLexicalEnvironment);
}