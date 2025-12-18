import type { BaseCallbackConfig } from '@langchain/core/callbacks/manager';
import type { IExecuteFunctions } from 'n8n-workflow';

interface TracingConfig {
	additionalMetadata?: Record<string, unknown>;
}

export function getTracingConfig(
	context: IExecuteFunctions,
	config: TracingConfig = {},
): BaseCallbackConfig {
	const parentRunManager = context.getParentCallbackManager
		? context.getParentCallbackManager()
		: undefined;

	return {
		runName: `[${context.getWorkflow().name}] ${context.getNode().name}`,
		metadata: {
			execution_id: context.getExecutionId(),
			...Object.fromEntries(
				Object.entries(context.getWorkflow()).map(
					([key, value]) => [`workflow_${key}`, value]
				)
			),
			node: context.getNode().name,
			...(config.additionalMetadata ?? {}),
		},
		callbacks: parentRunManager,
	};
}
