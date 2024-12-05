import type { BubbleProps } from './features/bubble';
import type { MenuProps } from './features/menu';
import { Flow } from './features/bubble/types';
import { HomeProps } from './pages/Home/Home';

export const defaultBotProps: BubbleProps = {
  chatflowid: '',
  apiHost: undefined,
  onRequest: undefined,
  chatflowConfig: undefined,
  theme: undefined,
  observersConfig: undefined,
  flow: Flow.Empty,
};

export const constants = {
  apiUtilsUrl: 'https://ca-ai-utils-api-prod-eastus2-001.bravepond-9830b784.eastus2.azurecontainerapps.io',
  n8nPdfPath: 'webhook/plain-text',
  n8nDomain: 'https://interseas-n8n.paas.startse.com',
  n8nFirstStep: 'criticalAnalysisFirstStep',
  n8nSecondStep: 'criticalAnalysisSecondStep',
  n8nThirdStep: 'criticalAnalysisThirdStep',
  n8nFourthStep: 'criticalAnalysisFourthStep',
  n8nFifthStep: 'criticalAnalysisFifthStep',
  n8nSixthStep: 'criticalAnalysisSixthStep',
  n8nSeventhStep: 'criticalAnalysisSeventhStep',
  n8nFlowSendDataToSupabase: 'sendDataToSupabase',
  n8nFlowGetDataFromSupabase: 'getDataFromSupabase',
  n8nFlowFetchChatDocumentRelation: 'fetchChatDocumentRelation',
  n8nFlowFetchDocumentsByChatId: 'fetchDocumentsByChatId',
  n8nFlowFetchChatIdsForFlow: 'fetchChatIdsForFlow',
  n8nFlowSendDeleteChatRequest: 'sendDeleteChatRequest',
  n8nFlowSendUpdateChatRequest: 'sendUpdateChatRequest',
  flowiseJwtToken: 'tV-zG93Qky61gJh-m51RYZEGJ2DOMrM3P1LhhjvcHXA'
};

export const defaultMenuProps: MenuProps = {
  currentFlow: '',
  chatflowid: undefined,
  items: [],
  fillColor: '#F4F6FF',
  chatflowid: '',
};

export const defaultHomeProps: HomeProps = {
  items: [],
};
