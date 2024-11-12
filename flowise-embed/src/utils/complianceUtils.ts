export type messagesArray = {
  messages: string[];
};
export const CCTCOMPLIANCE = `COMPLIANCE NOTES - CCT AÉREO X CONHECIMENTO HAWB

- Identificação do conhecimento de carga: [VALOR DO CCT AÉREO]  
    - HAWB - Número do HAWB: [VALOR DO HAWB]

- Data/hora de emissão: [VALOR DO CCT AÉREO]  
    - HAWB - Data de emissão do HAWB: [VALOR DO HAWB]

- Aeroporto de origem: [VALOR DO CCT AÉREO]  
    - HAWB - Airport of Departure: [VALOR DO HAWB]

- Aeroporto de destino: [VALOR DO CCT AÉREO]  
    - HAWB - Airport of Destination: [VALOR DO HAWB]

- Recinto aduaneiro de destino: [VALOR DO CCT AÉREO]  
    - HAWB - Final Destination (se não constar, igual ao Airport of Destination): [VALOR DO HAWB]

- Quantidade de volumes: [VALOR DO CCT AÉREO]  
    - HAWB - Nº of Pieces: [VALOR DO HAWB]

- Peso Bruto: [VALOR DO CCT AÉREO]  
    - HAWB - Gross Weight: [VALOR DO HAWB]

- Indicador de presença de partes e peças de madeira maciça: [VALOR DO CCT AÉREO]  
    - HAWB - Wooden Packing: [VALOR DO HAWB]

- Descrição resumida das mercadorias: [VALOR DO CCT AÉREO]  
    - HAWB - Description of Goods (resumida): [VALOR DO HAWB]

- Descrição completa das mercadorias: [VALOR DO CCT AÉREO]  
    - HAWB - Description of Goods (completa): [VALOR DO HAWB]

- Moeda de origem: [VALOR DO CCT AÉREO]  
    - HAWB - Moeda do frete: [VALOR DO HAWB]

- Frete por item de carga: [VALOR DO CCT AÉREO]  
    - HAWB - Valor total do frete: [VALOR DO HAWB]

- Forma de pagamento // Por peso/valor: [VALOR DO CCT AÉREO]  
    - HAWB - Collect/Prepaid (peso/valor): [VALOR DO HAWB]

- Forma de pagamento // Outros encargos: [VALOR DO CCT AÉREO]  
    - HAWB - Collect/Prepaid (outros encargos): [VALOR DO HAWB]

- Totais na moeda de origem: [VALOR DO CCT AÉREO]  
    - HAWB - Valor total do frete: [VALOR DO HAWB]

- Embarcador estrangeiro: [VALOR DO CCT AÉREO]  
    - HAWB - Shipper: [VALOR DO HAWB]

- País: [VALOR DO CCT AÉREO]  
    - HAWB - País do Shipper: [VALOR DO HAWB]

- Consignatário / Identificação: [VALOR DO CCT AÉREO]  
    - HAWB - CNPJ do Consignee: [VALOR DO HAWB]

- MAWB/AWB associados: [VALOR DO CCT AÉREO]  
    - HAWB - Conforme consta no HAWB: [VALOR DO HAWB]
`;

export const CE_MERCANTE = `
COMPLIANCE NOTES - CE MERCANTE X CONHECIMENTO BL

- Número do conhecimento de embarque: [VALOR DO CE MERCANTE]  
    - Conhecimento BL - Número do conhecimento de embarque: [VALOR DO BL]

- NCM: [VALOR DO CE MERCANTE]  
    - Conhecimento BL - NCM: [VALOR DO BL]

- Dados do Importador (Consignee) - Razão social e CNPJ: [VALOR DO CE MERCANTE]  
    - Conhecimento BL - Dados do Consignatário (Consignee): [VALOR DO BL]

- Dados do Adquirente (Notify) - Razão social: [VALOR DO CE MERCANTE]  
    - Conhecimento BL - Dados do adquirente (Notify): [VALOR DO BL]

- Peso Bruto: [VALOR DO CE MERCANTE]  
    - Conhecimento BL - Peso Bruto: [VALOR DO BL]

- Cubagem: [VALOR DO CE MERCANTE]  
    - Conhecimento BL - Cubagem: [VALOR DO BL]

- Porto de origem: [VALOR DO CE MERCANTE]  
    - Conhecimento BL - Porto de embarque: [VALOR DO BL]

- Porto de descarregamento: [VALOR DO CE MERCANTE]  
    - Conhecimento BL - Local de desembarque: [VALOR DO BL]

- Valor do frete total (Prepaid/Collect; moeda; valor): [VALOR DO CE MERCANTE]  
    - Conhecimento BL - Valor do frete: [VALOR DO BL]

- Número dos containers (formato <3 letras>U<7 números>): [VALOR DO CE MERCANTE]  
    - Conhecimento BL - Número dos containers: [VALOR DO BL]

- Quantidade de containers: [VALOR DO CE MERCANTE]  
    - Conhecimento BL - Quantidade de containers: [VALOR DO BL]`;

export const CRT = `
COMPLIANCE NOTES - CRT X MIC-DTA

- Número do CRT: [VALOR DO CRT]
    - MIC-DTA - Número do documento: [VALOR DO MIC DTA]

- Remetente: [VALOR DO CRT]
    - MIC-DTA - Remetente: [VALOR DO MIC DTA]

- Destinatário: [VALOR DO CRT]
    - MIC-DTA - Destinatário: [VALOR DO MIC DTA]

- Consignatário: [VALOR DO CRT]
    - MIC-DTA - Consignatário: [VALOR DO MIC DTA]

- Local de Embarque: [VALOR DO CRT]
    - MIC-DTA - Local de Embarque: [VALOR DO MIC DTA]

- Local de destino final: [VALOR DO CRT]
    - MIC-DTA - Local de destino final: [VALOR DO MIC DTA]

- Tipos de volumes: [VALOR DO CRT]
    - MIC-DTA - Tipos de volumes: [VALOR DO MIC DTA]

- Quantidade de volumes: [VALOR DO CRT]
    - MIC-DTA - Quantidade de volumes: [VALOR DO MIC DTA]

- Informação "Wooden Packing": [VALOR DO CRT]
    - MIC-DTA - Informação "Wooden Packing": [VALOR DO MIC DTA]

- Descrição resumida das mercadorias: [VALOR DO CRT]
    - MIC-DTA - Descrição resumida das mercadorias: [VALOR DO MIC DTA]

- Código/Referência das mercadorias: [VALOR DO CRT]
    - MIC-DTA - Código/Referência das mercadorias: [VALOR DO MIC DTA]

- NCM: [VALOR DO CRT]
    - MIC-DTA - NCM: [VALOR DO MIC DTA]

- Número de série (máquinas e equipamentos): [VALOR DO CRT]
    - MIC-DTA - Número de série (máquinas e equipamentos): [VALOR DO MIC DTA]

- Fatura comercial: [VALOR DO CRT]
    - MIC-DTA - Fatura comercial: [VALOR DO MIC DTA]

- Peso Bruto: [VALOR DO CRT]
    - MIC-DTA - Peso Bruto: [VALOR DO MIC DTA]

- Peso Líquido: [VALOR DO CRT]
    - MIC-DTA - Peso Líquido: [VALOR DO MIC DTA]

- Frete: [VALOR DO CRT]
    - MIC-DTA - Valor do frete: [VALOR DO MIC DTA]

- Seguro: [VALOR DO CRT]
    - MIC-DTA - Valor do seguro: [VALOR DO MIC DTA]

- Declaração valor das mercadorias: [VALOR DO CRT]
    - MIC-DTA - Valor da mercadoria: [VALOR DO MIC DTA]

- Documentos anexos: [VALOR DO CRT]
    - MIC-DTA - Documentos anexos: [VALOR DO MIC DTA]
`;
