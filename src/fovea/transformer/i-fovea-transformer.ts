import {IFoveaTransformerOptions} from "./i-fovea-transformer-options";
import {CustomTransformers} from "typescript";

export type IFoveaTransformer = (transformerOptions: IFoveaTransformerOptions) => CustomTransformers;