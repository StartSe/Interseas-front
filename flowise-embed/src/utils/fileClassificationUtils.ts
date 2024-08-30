export const checklistCeMercante = `
• NCM
• Importador
• Adquirente
• Peso Bruto
• Data de embarque
• Local de Embarque
• Valores Lançados (Prepaid/Collect; moeda; valor)
• Consulta benefícios isenção/suspensão do AFRMM - AI
• Solicitar inclusão dos valores de Capatazia/THC no BL`;

export const checklistCertificadoOrigem = `
• Dados do Exportador
• Dados do Importador
• Dados do Consignatário
• Acordo
• Fatura Comercial
• Valor da mercadoria
• Quantidade
• NCM
Se operação por Conta e Ordem:
• Dados do Adquirente (no campo Observações)`;

export const checklistCommercialInvoice = `
• Número do documento
• Nome do documento
• Data
• Assinatura à mão
• Dados do Importador - também chamado de Consignee (Razão social, endereço e CNPJ)
• Dados do Adquirente - também chamado de Buyer (se importação por Conta e Ordem ou por Encomenda)
• Dados do Exportador (nome, endereço, NIF)
• Dados do Fabricante (nome, endereço, NIF)
• Marca
• Numeração
• Número de referência dos volumes
• Descrição
• Referência
• Quantidade
• Unidade Comercializada
• Valor Unitário (não zerado)
• Valor Total (não zerado)
• Moeda
• Forma/Condições de Pagamento
• Dados Bancários Exportador
• Porto de Embarque
• Porto de Desembarque
• País de Origem
• País Procedência
• País de Aquisição
• INCOTERM
• Local do INCOTERM
• Valor do Frete (se prepaid)
• Valor do Seguro (se prepaid)
• Peso Líquido Total
• Peso Bruto Total
• Quantidade de Volumes
• Tipo de Volumes
• Descrição EX-tarifário (no formato "EX-[número]")
Se mercadoria é máquina ou equipamento
• Nº de Série
• Marca
• Modelo
Conferências:
• Multiplicação de valor unitário = quantidade comercializada de cada item
• Somatório dos itens = valor total informado`;

export const checklistConhecimentoBL = `
• Shipper (nome, endereço)
• Dados do Importador - também chamado de Consignee (razão social, endereço e CNPJ)
• Notify (razão social, endereço e CNPJ)
• Valor do Frete
• Moeda do Frete
• Tipo de Frete
• Número dos containers (no formato <3 letras>U<7 números>)
• Número dos lacres dos containers (seal)
• Local de Recebimento
• Porto de Embarque
• Porto de Desembarque
• Local de Destino
• Peso Bruto
• Cubagem
• Quantidade de Volumes
• Tipo de Volumes
• Informação "Wooden Packing"
• Descrição resumida das mercadorias
• NCM (primeiros 4 dígitos)
• Valor da Capatazia (THC)
• Descrição EX-tarifário (no formato "EX-[número]")
Se mercadoria é máquina ou equipamento
• Nº de Série
Conferências:
• Se importação direta:
Notify = Importador
• Se importação por Conta e Ordem:
Notify = Adquirente ou Importador
• Se INCOTERM de responsabilidade do exportador:
Tipo de frete = "Prepaid"
• Se INCOTERM de responsabilidade do importador:
Tipo de frete = "Collect"`;

export const checklistConhecimentoHawb = `
• Shipper (nome, endereço)
• Dados do Importador - também chamado de Consignee (razão social, endereço e CNPJ)
• Notify (razão social, endereço e CNPJ)
• Valor do Frete
• Moeda do Frete
• Tipo de Frete
• Aeroporto de Partida
• Aeroporto de Destino
• Peso Bruto
• Peso Taxado
• Quantidade de Volumes
• Informação "Wooden Packing"
• Descrição resumida das mercadorias
Se mercadoria é máquina ou equipamento
• Nº de Série
• Se INCOTERM de responsabilidade do exportador:
Tipo de frete = "Prepaid"
• Se INCOTERM de responsabilidade do importador:
Tipo de frete = "Collect"`;

export const checklistCRT = `
• Shipper
• Consignee
• Notify
• Frete
• Tipo de Frete
• Nº Contêineres/Lacres
• Local de Recebimento
• Porto | Embarque
• Porto | Desembarque
• Local de Destino
• Peso Bruto
• Cubagem
• Quantidade de Volumes
• Tipo de Volumes
• Detalhamento volumes (Processed Wood/ Treated and
• NCM (4 dígitos)
• Nº de Série (obrigatório para máquinas e equipamentos)
• Processo com EX|Descrição Conforme o Ex-tarifário`;

export const checklistPackingList = ` 
• Referência à Ordem de Compra (OC) ou Fatura Comercial
• Dados do Importador - também chamado de Consignee (Razão social, endereço e CNPJ)
• Dados do Adquirente ou Encomendante - também chamado de Buyer (se importação por Conta e Ordem ou por Encomenda)
• Dados do Exportador (nome, endereço, NIF)
• Descrição ou referência
• Espécie dos volumes
• Quantidade total de Volumes
• Peso Líquido por volume
• Peso Líquido total
• Peso Bruto total
• Cubagem total`;

export const ChecklistProformaInvoice = `
• Número do documento
• Nome do documento
• Data do documento
• Assinatura
• Dados do Importador - também chamado de Consignee (Razão social, endereço e CNPJ)
• Dados do Adquirente - também chamado de Buyer (se importação por Conta e Ordem ou por Encomenda)
• Dados do Exportador (nome, endereço)
• País de origem
• Descrição da mercadoria
• Quantidade
• Unidade comercializada
• Valor unitário de cada espécie de mercadoria
• Valor total de cada espécie de mercadoria
• Moeda de pagamento
• Condições de pagamento
• Dados bancários do exportador
• INCOTERM
• Local do INCOTERM
• Peso estimado
• Quntidade de volumes estimada
• Dimensão estimada dos volumes
Conferências:
• Multiplicação do valor unitário = quantidade comercializada de cada item
• Somatório dos itens = valor total informado`;

export enum DocumentTypes {
  PROFORMA_INVOICE = 'PROFORMA INVOICE',
  COMMERCIAL_INVOICE = 'COMMERCIAL INVOICE',
  PACKING_LIST = 'PACKING LIST',
  CONHECIMENTO_BL = 'CONHECIMENTO - B/L',
  CONHECIMENTO_HAWB = 'HAWB',
  CONHECIMENTO_MAWB = 'CONHECIMENTO - MAWB',
  CONHECIMENTO_CRT = 'CONHECIMENTO - CRT',
  CONHECIMENTO_MIC_DTA = 'CONHECIMENTO - MIC/DTA',
  CE_MERCANTE = 'CE MERCANTE',
  CCT = 'CCT',
  INSTRUCAO_DE_EMBARQUE = 'INSTRUÇÃO DE EMBARQUE',
  DUIMP = 'DUIMP',
  DUE = 'DU-E',
  DECLARACAO_DE_IMPORTACAO = 'DECLARAÇÃO DE IMPORTAÇÃO',
  RESUMO_DA_DECLARACAO_DE_IMPORTACAO = 'RESUMO DA DECLARAÇÃO DE IMPORTAÇÃO',
  LICENCA_DE_IMPORTACAO = 'LICENÇA DE IMPORTAÇÃO',
  LPCO = 'LPCO (LICENÇAS, PERMISSÕES, CERTIFICADOS E OUTROS)',
  DOWNPAYMENT_INVOICE = 'DOWNPAYMENT INVOICE',
  PROPOSTA = 'PROPOSTA',
  ORDEM_DE_COMPRA_DO_IMPORTADOR = 'ORDEM DE COMPRA DO IMPORTADOR',
  SALES_ORDER_DOCUMENT = 'SALES ORDER DOCUMENT',
  CONFIRMATION_OF_ORDER = 'CONFIRMATION OF ORDER',
  CERTIFICADO_DE_ORIGEM_DIGITAL = 'CERTIFICADO DE ORIGEM DIGITAL',
  CERTIFICADO_DE_ORIGEM = 'CERTIFICADO DE ORIGEM',
  TEST_REPORT = 'TEST REPORT',
  LABELS = 'LABEL',
  ANEXO_IX = 'ANEXO IX - CERTIFICADO DE ORIGEM DE BEBIDAS, FERMENTADOS ACÉTICOS, VINHOS E DERIVADOS DA UVA E DO VINHO PARA O BRASIL',
  ANEXO_XI = 'ANEXO XI - COMPROVAÇÃO OFICIAL DE TIPICIDADE E REGIONALIDADE DE BEBIDAS ALCOÓLICAS, VINHOS E DERIVADOS DA UVA E DO VINHO PARA IMPORTAÇÃO PELO BRASIL',
  CERTIFICADO_DE_INSPECAO = 'CERTIFICADO DE INSPEÇÃO DE IMPORTAÇÃO DE BEBIDAS, FERMENTADOS ACÉTICOS, VINHOS E DERIVADOS DA UVA E DO VINHO',
  CERTIFICADO_DE_CONFORMIDADE_ORGANICA = 'CERTIFICADO DE CONFORMIDADE ORGÂNICA',
  DECLARACAO_DE_TRANSACAO_COMERCIAL = 'DECLARAÇÃO DE TRANSAÇÃO COMERCIAL',
  ATESTADO_DE_INEXISTENCIA_DE_PRODUCAO_ESTADUAL = 'ATESTADO DE INEXISTÊNCIA DE PRODUÇÃO ESTADUAL',
  CATALOGO_DE_EQUIPAMENTO = 'CATALOGO DE EQUIPAMENTO',
  CERTIFICADO_DE_COMPLIANCE = 'CERTIFICADO DE COMPLIANCE',
  CERTIFICADO_DE_ESTERILIZACAO = 'CERTIFICADO DE ESTERILIZAÇÃO',
  DECLARACAO_DO_DETENTOR_DA_REGULARIZACAO = 'DECLARAÇÃO DO DETENTOR DA REGULARIZAÇÃO',
  MSDS = 'MSDS',
  FICHA_DE_EMERGENCIA = 'FICHA DE EMERGÊNCIA',
  FISPQ = 'FISPQ',
  SHIPPERS_DECLARATION = "SHIPPER'S DECLARATION FOR DANGEROUS GOODS",
  ANEXO_VII = 'DECLARAÇÃO DE CARGA PERIGOSA',
  FICHA_DE_LOTE = 'FICHA DE LOTE',
  CERTIFICADO_FITOSSANITARIO = 'CERTIFICADO FITOSSANITÁRIO',
}

const documentNameAndTypeMapping = {
  'PROFORMA[_-\\s]INVOICE|PROFORMA': DocumentTypes.PROFORMA_INVOICE,
  'COMMERCIAL[_-\\s]INVOICE|FATURA[_-\\s]COMERCIAL|CUSTOMS[_-\\s]INVOICE|INVOICE': DocumentTypes.COMMERCIAL_INVOICE,
  'PACKING[_-\\s]LIST': DocumentTypes.PACKING_LIST,
  'CONHECIMENTO[_-\\s]BL|CONHECIMENTO[_-\\s]B/L|BL': DocumentTypes.CONHECIMENTO_BL,
  'CONHECIMENTO[_-\\s]HAWB|HAWB': DocumentTypes.CONHECIMENTO_HAWB,
  'CONHECIMENTO[_-\\s]MAWB|MAWB': DocumentTypes.CONHECIMENTO_MAWB,
  'CONHECIMENTO[_-\\s]CRT|CRT': DocumentTypes.CONHECIMENTO_CRT,
  'CONHECIMENTO[_-\\s]MIC[_-\\s]DTA|MIC[_-\\s]DTA': DocumentTypes.CONHECIMENTO_MIC_DTA,
  'CE[_-\\s]MERCANTE': DocumentTypes.CE_MERCANTE,
  CCT: DocumentTypes.CCT,
  'INSTRUCAO[_-\\s]DE[_-\\s]EMBARQUE': DocumentTypes.INSTRUCAO_DE_EMBARQUE,
  DUIMP: DocumentTypes.DUIMP,
  'DU-E|DU E': DocumentTypes.DUE,
  'DECLARACAO[_-\\s]DE[_-\\s]IMPORTACAO': DocumentTypes.DECLARACAO_DE_IMPORTACAO,
  'RESUMO[_-\\s]DA[_-\\s]DECLARACAO[_-\\s]DE[_-\\s]IMPORTACAO': DocumentTypes.RESUMO_DA_DECLARACAO_DE_IMPORTACAO,
  'LICENCA[_-\\s]DE[_-\\s]IMPORTACAO': DocumentTypes.LICENCA_DE_IMPORTACAO,
  LPCO: DocumentTypes.LPCO,
  'DOWNPAYMENT[_-\\s]INVOICE|DOWNPAYMENT': DocumentTypes.DOWNPAYMENT_INVOICE,
  PROPOSTA: DocumentTypes.PROPOSTA,
  'ORDEM[_-\\s]DE[_-\\s]COMPRA[_-\\s]DO[_-\\s]IMPORTADOR|PURCHASE[_-\\s]ORDER[_-\\s]PO|PO': DocumentTypes.ORDEM_DE_COMPRA_DO_IMPORTADOR,
  'SALES[_-\\s]ORDER[_-\\s]DOCUMENT|SALES[_-\\s]ORDER[_-\\s]ACKNOWLEDGMENT': DocumentTypes.SALES_ORDER_DOCUMENT,
  'CONFIRMATION[_-\\s]OF[_-\\s]ORDER': DocumentTypes.CONFIRMATION_OF_ORDER,
  'CERTIFICADO[_-\\s]DE[_-\\s]ORIGEM[_-\\s]DIGITAL': DocumentTypes.CERTIFICADO_DE_ORIGEM_DIGITAL,
  'CERTIFICADO[_-\\s]DE[_-\\s]ORIGEM': DocumentTypes.CERTIFICADO_DE_ORIGEM,
  'TEST[_-\\s]REPORT|LABORATORY[_-\\s]REPORT|CERTIFICADO[_-\\s]DE[_-\\s]ANALISE': DocumentTypes.TEST_REPORT,
  'LABELS|LABEL|CONTRA[_-\\s]ROTULO': DocumentTypes.LABELS,
  'ANEXO[_-\\s]IX|CERTIFICADO[_-\\s]DE[_-\\s]ORIGEM[_-\\s]DE[_-\\s]BEBIDAS[_-\\s]FERMENTADOS[_-\\s]ACETICOS[_-\\s]VINHOS[_-\\s]E[_-\\s]DERIVADOS[_-\\s]DA[_-\\s]UVA[_-\\s]E[_-\\s]DO[_-\\s]VINHO[_-\\s]PARA[_-\\s]O[_-\\s]BRASIL':
    DocumentTypes.ANEXO_IX,
  'ANEXO[_-\\s]XI|COMPROVACAO[_-\\s]OFICIAL[_-\\s]DE[_-\\s]TIPICIDADE[_-\\s]E[_-\\s]REGIONALIDADE[_-\\s]DE[_-\\s]BEBIDAS[_-\\s]ALCOOLICAS[ ,-_]VINHOS[ ,-_]E[_-\\s]DERIVADOS[_-\\s]DA[_-\\s]UVA[_-\\s]E[_-\\s]DO[_-\\s]VINHO[_-\\s]PARA[_-\\s]IMPORTACAO[_-\\s]PELO[_-\\s]BRASIL':
    DocumentTypes.ANEXO_XI,
  'CERTIFICADO[_-\\s]DE[_-\\s]INSPEÇÃO[_-\\s]DE[_-\\s]IMPORTAÇÃO[_-\\s]DE[_-\\s]BEBIDAS[ ,-_]FERMENTADOS[ ,-_]ACÉTICOS[ ,-_]VINHOS[_-\\s]E[_-\\s]DERIVADOS[_-\\s]DA[_-\\s]UVA[_-\\s]E[_-\\s]DO[_-\\s]VINHO':
    DocumentTypes.CERTIFICADO_DE_INSPECAO,
  'CERTIFICADO[_-\\s]DE[_-\\s]CONFORMIDADE[_-\\s]ORGANICA|DECLARACION[_-\\s]ADICIONAL[_-\\s]SOBRE[_-\\s]MEMORANDUM[_-\\s]DE[_-\\s]ACUERDO[_-\\s]CHILE[_-\\s]BRASIL':
    DocumentTypes.CERTIFICADO_DE_CONFORMIDADE_ORGANICA,
  'DECLARACAO[_-\\s]DE[_-\\s]TRANSACAO[_-\\s]COMERCIAL|CERTIFICADO[_-\\s]TRANSACCION[_-\\s]PARA[_-\\s]PRODUCTOS[_-\\s]IMPORTADOS':
    DocumentTypes.DECLARACAO_DE_TRANSACAO_COMERCIAL,
  'ATESTADO[_-\\s]DE[_-\\s]INEXISTENCIA[_-\\s]DE[_-\\s]PRODUCAO[_-\\s]ESTADUAL': DocumentTypes.ATESTADO_DE_INEXISTENCIA_DE_PRODUCAO_ESTADUAL,
  'CATALOGO[_-\\s]DE[_-\\s]EQUIPAMENTO': DocumentTypes.CATALOGO_DE_EQUIPAMENTO,
  'CERTIFICADO[_-\\s]DE[_-\\s]COMPLIANCE|CERTIFICADO[_-\\s]DE[_-\\s]CONFORMIDADE': DocumentTypes.CERTIFICADO_DE_COMPLIANCE,
  'CERTIFICADO[_-\\s]DE[_-\\s]ESTERILIZACAO': DocumentTypes.CERTIFICADO_DE_ESTERILIZACAO,
  'DECLARACAO[_-\\s]DO[_-\\s]DETENTOR[_-\\s]DA[_-\\s]REGULARIZACAO[_-\\s]DO[_-\\s]PRODUTO[_-\\s]AUTORIZANDO[_-\\s]A[_-\\s]IMPORTACAO[_-\\s]POR[_-\\s]TERCEIRO':
    DocumentTypes.DECLARACAO_DO_DETENTOR_DA_REGULARIZACAO,
  'MSDS|MATERIAL[_-\\s]SAFETY[_-\\s]DATA[_-\\s]SHEET|SAFETY[_-\\s]DATA[_-\\s]SHEET': DocumentTypes.MSDS,
  'FICHA[_-\\s]DE[_-\\s]EMERGENCIA': DocumentTypes.FICHA_DE_EMERGENCIA,
  'FISPQ|FICHA[_-\\s]DE[_-\\s]INFORMACOES[_-\\s]DE[_-\\s]SEGURANCA[_-\\s]DE[_-\\s]PRODUTOS[_-\\s]QUIMICOS': DocumentTypes.FISPQ,
  'SHIPPERS[_-\\s]DECLARATION[_-\\s]FOR[_-\\s]DANGEROUS[_-\\s]GOODS': DocumentTypes.SHIPPERS_DECLARATION,
  'ANEXO[_-\\s]VII[_-\\s]DECLARACAO[_-\\s]DE[_-\\s]CARGA[_-\\s]PERIGOSA|ANEXO[_-\\s]VII/i': DocumentTypes.ANEXO_VII,
  'FICHA[_-\\s]DE[_-\\s]LOTE/i': DocumentTypes.FICHA_DE_LOTE,
  'CERTIFICADO[_-\\s]FITOSSANITARIO/i': DocumentTypes.CERTIFICADO_FITOSSANITARIO,
};

export const checklistTypeMapping = {
  [DocumentTypes.PROFORMA_INVOICE]: ChecklistProformaInvoice,
  [DocumentTypes.COMMERCIAL_INVOICE]: checklistCommercialInvoice,
  [DocumentTypes.PACKING_LIST]: checklistPackingList,
  [DocumentTypes.CONHECIMENTO_BL]: checklistConhecimentoBL,
  [DocumentTypes.CONHECIMENTO_HAWB]: checklistConhecimentoHawb,
  [DocumentTypes.CONHECIMENTO_CRT]: checklistCRT,
  [DocumentTypes.CE_MERCANTE]: checklistCeMercante,
  [DocumentTypes.CERTIFICADO_DE_ORIGEM]: checklistCertificadoOrigem,
};

export const identifyDocumentChecklist = (documentType: keyof typeof DocumentTypes) => {
  if (documentType in checklistTypeMapping) {
    return checklistTypeMapping[documentType as keyof typeof checklistTypeMapping];
  }
  return null;
};

export const identifyDocumentType = (fileName: string) => {
  for (const [regex, type] of Object.entries(documentNameAndTypeMapping)) {
    if (new RegExp(regex, 'i').test(fileName)) {
      return type as keyof typeof DocumentTypes;
    }
  }
  return null;
};
