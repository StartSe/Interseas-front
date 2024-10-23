import type { BubbleProps } from './features/bubble';
import type { MenuProps } from './features/menu';
import { Flow } from './features/bubble/types';

export const defaultBotProps: BubbleProps = {
  chatflowid: '',
  apiHost: undefined,
  chatflowConfig: undefined,
  theme: undefined,
  observersConfig: undefined,
  flow: Flow.Empty,
};

export const constants = {
  apiUtilsUrl: 'https://ca-ai-utils-api-prod-eastus2-001.bravepond-9830b784.eastus2.azurecontainerapps.io',
  n8nPdfPath: 'webhook/plain-text',
  n8nDomain: 'https://interseas-n8n.paas.startse.com',
  n8nFirstStep: 'a96d9f14-3835-4e08-b8a7-a77f3b754886',
  n8nSecondStep: '0164614d-e044-4c3f-9ef9-9212407bf402',
  n8nThirdStep: '484dc0f1-3431-4d3a-be2b-0cb9b39989ff',
  n8nFourthStep: 'a5f9547f-905b-4fc0-b5dc-3ebbb5936eda',
  n8nFifthStep: 'e05fca0c-20fb-42ed-a923-a627d9ae7f13',
  n8nSixthStep: '50b6723d-7cff-4ecf-852e-f693efd9d95f',
  n8nSeventhStep: '916a955c-467e-4830-9d95-3bb3fc976698',
  supabaseApiEndpoint: 'https://virfxvqlitfelwvsamuw.supabase.co/',
  supabaseApiKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpcmZ4dnFsaXRmZWx3dnNhbXV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyODMyOTIxNCwiZXhwIjoyMDQzOTA1MjE0fQ.lY1MfXPHo9IbzFlBxMt-RVJ8uqXN9G3rKCVzvSjWUBg',
  n8nFlowSendDataToSupabase: '83faf03f-f684-4b7c-9c07-10f0fb237a26',
};

export const defaultMenuProps: MenuProps = {
  currentId: '',
  items: [],
};
