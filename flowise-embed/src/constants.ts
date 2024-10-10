import type { BubbleProps } from './features/bubble';

export const defaultBotProps: BubbleProps = {
  chatflowid: '',
  apiHost: undefined,
  chatflowConfig: undefined,
  theme: undefined,
  observersConfig: undefined,
  flow: '',
};

export const constants = {
  apiUtilsUrl: 'https://ca-ai-utils-api-prod-eastus2-001.bravepond-9830b784.eastus2.azurecontainerapps.io',
  n8nDomain: 'https://interseas-n8n.paas.startse.com',
  n8nFirstStep: 'a96d9f14-3835-4e08-b8a7-a77f3b754886',
  n8nSecondStep: '0164614d-e044-4c3f-9ef9-9212407bf402',
  n8nThirdStep: '484dc0f1-3431-4d3a-be2b-0cb9b39989ff',
  n8nFourthStep: 'a5f9547f-905b-4fc0-b5dc-3ebbb5936eda',
  n8nSixthStep: 'd9a6bc71-e1da-42a0-96c9-0a29fc92eedc',
  n8nSeventhStep: '916a955c-467e-4830-9d95-3bb3fc976698',
};
