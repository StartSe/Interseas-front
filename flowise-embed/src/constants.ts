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
  n8nDomain: 'https://n8n.startse.com',
  n8nFirstStep: 'a96d9f14-3835-4e08-b8a7-a77f3b754886',
  n8nSecondStep: 'a5f9547f-905b-4fc0-b5dc-3ebbb5936eda',
};
