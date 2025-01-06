import { CriticalAnalysisPrefixes } from './criticalAnalysisUtils';

export const messageUtils = {
  FILE_TYPE_NOT_SUPPORTED: 'Este documento não é suportado. Por gentileza, exclua e carregue outro arquivo.',
  MODAL_TITLE: 'Faça o upload dos seus documentos.',
  MODAL_BUTTON: 'Confirmar envio',
  UPLOAD_BUTTON_LABEL: 'Fazer upload de documentos',
  UPLOADING_LABEL: 'Fazendo upload do documento',
  NEXT_CHECKLIST_BUTTON_LABEL: 'Próximo checklist',
  NEW_CHAT_BUTTON_LABEL: 'Novo chat',
  UPLOAD_LIMIT: 'Limite de arquivos:',
  SUPPORTED_FILE_TYPES: 'Formatos suportados:',
  ANY_DOCUMENT_WITHOUT_CHECKLIST_MESSAGE:
    'Um ou mais arquivos não puderam ter seu checklist identificado, mas os demais serão processados normalmente.',
  ALL_DOCUMENTS_VALIDATED_MESSAGE: 'Todos os seus documentos foram reconhecidos! Verifique cada um dos checklists abaixo detalhadamente',
  UNABLE_TO_PROCESS_CHECKLIST_MESSAGE: 'Não foi possível verificar o checklist deste arquivo.',
  UNABLE_TO_PROCESS_CROSS_VALIDATION_MESSAGE: 'Não foi possível verificar os campos deste arquivo.',
  NO_LI_LPCO_COMPLIANCE_FEATURE: 'Ainda não faço o compliance de LI/LPCO, por favor realizá-lo manualmente.',
  MANUAL_COMPLIANCE_ALERT: 'Atenção: Se há LPCO já emitido para a operação, realizar compliance do LPCO com a Fatura comercial manualmente.',

  CHECKLIST_NOT_FOUND_IN_RESPONSE_ERROR: 'Checklist not found in response',

  EX_TARIFF_IDENTIFIED: 'Identificada descrição de Ex-Tarifário no documento',
  EX_TARIFF_NOT_IDENTIFIED: 'Descrição de Ex-Tarifário não identificada no documento',
  EX_TARIFF_CHECK_ALERT_MESSAGE: 'Atenção, compare se a descrição referente está conforme a plataforma do EX-tarifário',
  IMPORT_LICENSE_NOT_FOUND_ALERT_MESSAGE: 'Dados de LI/Licença de importação não encontrados, revise os documentos enviados',
  CRITICAL_ANALYSIS_REQUIRED_DATA_LABEL: `Dados Necessários para Análise Crítica:`,
  CRITICAL_ANALYSIS_MISSING_DATA: 'Algumas informações não foram encontradas, por favor digite-as para prosseguirmos.',
  CRITICAL_ANALYSIS_MISSING_NCM: 'Caso ainda não possua a NCM, utilize o assistente de classificação fiscal.',
  CRITICAL_ANALYSIS_SUBMISSION_SUCCESS: 'Dados enviados para análise crítica!',
  CRITICAL_ANALYSIS_PROCESSING_ERROR: 'Error processing critical analysis update.',
  DATA_NOT_FOUND: 'não encontrado',
  NCM_TEXT_INPUT_REQUIRED: 'Envie o template para descoberta de NCM em formato texto',
  NCM_STEP_FAILURE: 'Error processing critical analysis step',
  NCM_INPUT_INSTRUCTIONS: `
Caso queira repetir a classificação envie novamente o template preenchido:

1. **Nome Comercial:**
2. **Finalidade de Uso:**
3. HS Code:
4. Nome Técnico:
5. Material Constitutivo (com percentuais, se aplicável):
6. Informações Complementares:
7. Sinônimo:
  `,
  NCM_DISCOVER_TEMPLATE: `
Para realizar a classificação fiscal da sua mercadoria, precisamos de algumas informações. Por favor, envie uma **mensagem de texto** preenchendo os campos abaixo e nosso time de especialistas irá classificar fiscalmente:

1. **Nome Comercial:**
2. **Finalidade de Uso:**
3. HS Code:
4. Nome Técnico:
5. Material Constitutivo (com percentuais, se aplicável):
6. Informações Complementares:
7. Sinônimo:`,
  criticalAnalysisFirstStepWarning: 'ATENÇÃO: Esta consulta não substitui o tratamento administrativo aplicável no momento do registro da DUIMP.',
  criticalAnalysisSecondStepWarning: 'ATENÇÃO: Esta consulta não substitui o tratamento tributário aplicável no momento do registro da DUIMP.',
  CRITICAL_ANALYSIS_TEMPLATE: `
Para iniciarmos a análise envie uma mensagem preenchendo os campos abaixo ou faça o **upload** (ícone no canto inferior esquerdo da caixa de texto) de um documento contendo as informações e nosso time de especialistas irá analisá-los:

1. **NCM:**
2. **INCOTERM:**
3. **Local do INCOTERM:**
4. **Peso Bruto Estimado:**
5. **m³ estimada/quantidade de volumes e dimensões:**
6. **País de origem/fabricação:**
7. **País de Embarque:**
8. **Estado do Importador:**`,
  YES: 'Sim',
  NO: 'Não',
  DELETE_CONFIRMATION: (chatName: string) => `Tem certeza que deseja excluir ${chatName}? Essa é uma ação permanente.`,
  CANCEL_BUTTON: 'Cancelar',
  DELETE_BUTTON: 'Excluir',
};

export const criticalAnalysisStepNameMapping: { [key: string]: string } = {
  [CriticalAnalysisPrefixes.criticalAnalysisFirstStep.toString()]: 'Tratamento Administrativo',
  [CriticalAnalysisPrefixes.criticalAnalysisSecondStep.toString()]: 'Tributos e contribuições federais',
  [CriticalAnalysisPrefixes.criticalAnalysisThirdStep.toString()]: 'Defesa Comercial',
  [CriticalAnalysisPrefixes.criticalAnalysisFourthStep.toString()]: 'Acordos Internacionais',
  [CriticalAnalysisPrefixes.criticalAnalysisFifthStep.toString()]: 'Análise Logística',
  [CriticalAnalysisPrefixes.criticalAnalysisSixthStep.toString()]: 'ICMS Importação',
  [CriticalAnalysisPrefixes.criticalAnalysisSeventhStep.toString()]: 'Atributos da NCM',
};

export const criticalAnalysisWarningMapping: { [key: string]: string } = {
  [CriticalAnalysisPrefixes.criticalAnalysisFirstStep.toString()]: messageUtils.criticalAnalysisFirstStepWarning,
  [CriticalAnalysisPrefixes.criticalAnalysisSecondStep.toString()]: messageUtils.criticalAnalysisSecondStepWarning,
};

export function ncmStepFailureMessage(prefix: string, ncm: string): string {
  return `Desculpe! Não foi possível completar a etapa de **${criticalAnalysisStepNameMapping[prefix]}** para o NCM **${ncm}**. Por favor, tente novamente.`;
}

export function complianceErrorMessage(errorMessages: string, isPlural: boolean): string {
  const pluralize = (word: string) => (isPlural ? `${word}s` : word);
  return `Não foi possivel realizar a Análise de Compliance. ${pluralize('O')} ${pluralize('seguinte')} ${pluralize('arquivo')} não ${
    isPlural ? 'puderam' : 'pôde'
  } ser ${pluralize('processado')}: ${errorMessages}. Verifique ${pluralize('o')} ${pluralize('arquivo')} e tente novamente.`;
}

export const DEFAULT_CHAT_NAME = (date: Date) => `Sem título - ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
