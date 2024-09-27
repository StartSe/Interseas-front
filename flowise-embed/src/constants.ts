import type { BubbleProps } from './features/bubble';
import type { BubblePropsCriticalAnalysis } from './features/bubbleCriticalAnalysis';

export const defaultBotProps: BubbleProps = {
  chatflowid: '',
  apiHost: undefined,
  chatflowConfig: undefined,
  theme: undefined,
  observersConfig: undefined,
};

export const defaultBotPropsAnalise: BubblePropsCriticalAnalysis = {
  chatflowid: '',
  apiHost: undefined,
  chatflowConfig: undefined,
  theme: undefined,
  observersConfig: undefined,
};

export const constants = {
  apiUtilsUrl: 'https://ca-ai-utils-api-prod-eastus2-001.bravepond-9830b784.eastus2.azurecontainerapps.io',
};
