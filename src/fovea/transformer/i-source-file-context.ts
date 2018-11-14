import {IMutableFoveaStats} from "../stats/i-fovea-stats";
import {FoveaDiagnostic} from "../diagnostic/fovea-diagnostic";
import {TypeChecker, TransformationContext} from "typescript";

export interface ISourceFileContext {
	transformationContext: TransformationContext;
	typeChecker: TypeChecker;

	addDiagnostic (diagnostic: FoveaDiagnostic): void;
	updateStats (stats: Partial<IMutableFoveaStats>): void;}