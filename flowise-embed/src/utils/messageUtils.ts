export const messageUtils = {
  FILE_TYPE_NOT_SUPPORTED: 'Este documento não é suportado. Por gentileza, exclua e carregue outro arquivo.',
  MODAL_TITLE: 'Faça o upload dos seus documentos.',
  MODAL_BUTTON: 'Confirmar envio',
  UPLOAD_BUTTON_LABEL: 'Fazer upload de documentos',
  UPLOADING_LABEL: 'Fazendo upload do documento',
  NEXT_CHECKLIST_BUTTON_LABEL: 'Próximo checklist',
  NEW_CHAT_BUTTON_LABEL: 'Novo chat',

  ANY_DOCUMENT_WITHOUT_CHECKLIST_MESSAGE:
    'Um ou mais arquivos não puderam ter seu checklist identificado, mas os demais serão processados normalmente.',
  ALL_DOCUMENTS_VALIDATED_MESSAGE: 'Todos os seus documentos estão validados corretamente! Verifique cada um dos checklists abaixo detalhadamente',
  UNABLE_TO_PROCESS_CHECKLIST_MESSAGE: 'Não foi possível verificar o checklist deste arquivo.',
  UNABLE_TO_PROCESS_CROSS_VALIDATION_MESSAGE: 'Não foi possível verificar os campos deste arquivo.',

  CHECKLIST_NOT_FOUND_IN_RESPONSE_ERROR: 'Checklist not found in response',

  EX_TARIFF_CHECK_ALERT_MESSAGE: 'Atenção, compare se a descrição referente está conforme a plataforma do EX-tarifário',
  IMPORT_LICENSE_NOT_FOUND_ALERT_MESSAGE: 'Dados de LI/Licença de importação não encontrados, revise os documentos enviados',

  CRITICAL_ANALYSIS_MISSING_DATA: 'Algumas informações não foram encontradas, por favor digite-as para prosseguirmos.',
  CRITICAL_ANALYSIS_SUBMISSION_SUCCESS: 'Dados enviados para análise crítica!',
  CRITICAL_ANALYSIS_PROCESSING_ERROR: 'Error processing critical analysis update.',
  DATA_NOT_FOUND: 'não encontrado',
  NCM_INICIAL_QUESTION: 'Deseja descobrir o NCM?',
  NCM_CONTINUE_QUESTION: 'Deseja continuar com o especialista em Classificação Fiscal?',
  NCM_HELP_QUESTION: 'Precisa de ajuda com a classificação Fiscal?',
  NCM_TEXT_INPUT_REQUIRED: 'Envie o template para descoberta de NCM em formato texto',
  NCM_DISCOVER_TEMPLATE: `
Para realizar a classificação fiscal da sua mercadoria, precisamos de algumas informações. Por favor, envie uma **mensagem de texto** preenchendo os campos abaixo e nosso time de especialistas irá classificar fiscalmente:

**Dados Obrigatórios:**

1. **Nome Comercial:**
2. **Finalidade de Uso:**

Dados Adicionais (opcional):

1. HS Code:
2. Nome Técnico:
3. Material Constitutivo (com percentuais, se aplicável): 
4. Informações Complementares: 
5. Sinônimo:`,
  CRITICAL_ANALYSIS_TEMPLATE: `
Para iniciarmos a análise envie uma mensagem preenchendo os campos abaixo ou faça o **upload**(ícone no canto inferior esquerdo da caixa de texto) de um documento contendo as informações e nosso time de especialistas irá analisá-los:

1. **NCM:**
2. **INCOTERM:**
3. **Local do INCOTERM:**
4. **Peso Bruto Estimado:**
5. **m³ estimada/quantidade de volumes e dimensões:**
6. **País de origem/fabricação:**
7. **País de Embarque:**
8. **Estado do Importador:**`,
};
