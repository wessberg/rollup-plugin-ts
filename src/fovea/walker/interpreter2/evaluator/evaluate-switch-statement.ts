import {IEvaluatorOptions} from "./i-evaluator-options";
import {CaseClause, DefaultClause, isCaseClause, isDefaultClause, SwitchStatement} from "typescript";
import {LiteralFlag, LiteralResult} from "../literal/literal";
import {LexicalEnvironment} from "../lexical-environment/lexical-environment";
import {cloneLexicalEnvironment} from "../lexical-environment/clone-lexical-environment";
import {cpsForeach} from "../util/cps/foreach";
import {ContinuationFlag} from "../continuation/continuation";

/**
 * Evaluates, or attempts to evaluate, a SwitchStatement
 * @param {IEvaluatorOptions<SwitchStatement>} options
 */
export function evaluateSwitchStatement ({node, environment, continuation, evaluate}: IEvaluatorOptions<SwitchStatement>): void {
	// Take the result of the switch expression
	evaluate(node.expression, environment, switchExpression => {
		// Prepare a lexical environment for the CaseBlock
		const caseBlockLexicalEnvironment: LexicalEnvironment = cloneLexicalEnvironment(environment);

		const caseClauses = <CaseClause[]>node.caseBlock.clauses.filter(clause => isCaseClause(clause));
		const defaultClause = <DefaultClause|undefined>node.caseBlock.clauses.find(clause => isDefaultClause(clause));
		let hasMatchedCaseClause: boolean = false;

		cpsForeach(
			caseClauses,
			(clause, _, next, done) => {
				evaluate(clause.expression, caseBlockLexicalEnvironment, clauseExpression => {
					if (clauseExpression.value !== switchExpression.value) return next();

					hasMatchedCaseClause = true;

					cpsForeach(
						clause.statements,
						(statement, _, nextStatement) => {
							evaluate(statement, caseBlockLexicalEnvironment, (currentValue, flag) => {
								if (flag === ContinuationFlag.CONTINUE) return done();
								if (flag === ContinuationFlag.BREAK) return done();
								return continuation(currentValue);
							})
						}
					);


				});
			},
			() => {
				if (!hasMatchedCaseClause && defaultClause != null) {

				}
			}
		);

		for (const clause of caseClauses) {
			const clauseExpression = continuation(clause.expression, caseBlockLexicalEnvironment);
			if (clauseExpression.value !== switchExpression.value) continue;

			const currentValue = continuation(clause.statements, caseBlockLexicalEnvironment);

			if (currentValue.flag === LiteralFlag.CONTINUE) continue;
			if (currentValue.flag === LiteralFlag.BREAK) break;
			if (currentValue.flag === LiteralFlag.RETURN) return currentValue;
		}

		if (defaultClause == null) return value;
		return localContinuation.run(defaultClause.statements, caseBlockLexicalEnvironment);
	});
}