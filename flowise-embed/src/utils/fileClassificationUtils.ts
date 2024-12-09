// PATTERN:
// LABEL - VARIANTS (FORMAT)

import { FileMapping } from './fileUtils';

export const defaultChecklist = `
• Número do documento
• Nome do documento
• Data da emissão
• Assinatura
• Dados do Remetente - Shipper (nome, endereço, CNPJ, CEP)
• Dados do Exportador (nome, endereço, NIF)
• Dados do Importador - também chamado de Consignee, Importer, Ship To (Razão social, endereço, CNPJ, CEP)
• Dados do Adquirente - Notify, Buyer, Sold to, Encomendante, Bill to, Notify Party (Razão social, endereço, CNPJ, CEP)
• Dados do Consignatário - (se houver)
• Dados do Destinatário - (razão social, endereço, CNPJ e CEP)
• País de origem
• País de Procedência
• País de Aquisição
• Tipo de Frete - pode ser 'Prepaid', 'Collect' ou 'Prepaid/Collect' quando houver os dois. Sempre verifique se há os dois tipos de frete.
• Moeda do Frete
• Frete - Todas as informações referentes a frete. Trazer tipo(Prepaid/Collect); moeda e valor (Total Prepaid; Total Collect; Total Freight, Basic Ocean Freight; Ocean Freight; O/F; OF; Freight; International freight; Freight and Charges, CAPATAZIA, THD). Trazer todas as informações que encontrar de forma detalhada, organizada com: Label, Tipo, moeda, valor. Traga uma string com todos estes dados. Não converta os atributos internos do frete para json.
• Componentes do frete - (Prepaid/Collect; moeda; valor)
• Forma/Condições de Pagamento - (true/false)
• Frete por item de carga - (somatório)
• Valor do Seguro - (se prepaid)
• Quantidade de containers
• Número dos containers - (formato <3 letras>U<7 números>)
• Número dos lacres dos containers - (seal)
• Peso Líquido - (N.W)
• Peso Líquido por volume - (N.W per volume)
• Peso Bruto - (G.W)
• Peso Taxado
• Cubagem - (m³/m3)
• Quantidade de Volumes - pode ser um entre: crate, box, pallets, bags ou outro relacionado ao tema volume
• Tipo de Volumes - pode ser um entre: crate, box, pallets, bags ou outro relacionado ao tema volume
• Dimensão estimada dos volumes - (volume x altura x largura)
• Nº de Série - (se mercadoria é máquina ou equipamento)
• Informação Wooden Packing - (Not applicable; Treated and Certified; Not-Treated and Not-Certified; Processed)
• NCM - (4 a 8 dígitos de cada NCM)
• Valor unitário de cada espécie de mercadoria - Considerando todas as páginas é o valor unitário multiplicado pela quantidade das mercadorias(quantidade X valor unitário, separando mercadorias diferentes por ';')
• Valor Total de cada espécie de mercadoria - Considerando todas as páginas é o valor unitário multiplicado pela quantidade das mercadorias ou apenas o valor total já informado no documento (quantidade X valor unitário separando mercadorias diferentes por ';')
• Quantidade - (formato quantidade x mercadoria)
• Unidade Comercializada
• Descrição resumida das mercadorias - (todos os nomes de produtos diferentes)
• Referência à Ordem de Compra (OC) ou Fatura Comercial
• Marca e Numeração - (Referência dos volumes)
• Porto de Embarque
• Porto de Desembarque
• Local de Recebimento
• Local de Destino Final
• Aeroporto de Partida
• Aeroporto de Destino
• Declaração valor das mercadorias
• Declarações e observações - detalhamento do frete internacional e nacional
• Valor da Capatazia - THC, DTHC, THD, Terminal Handling Charge, Terminal Handling Charge Destination
• Descrição EX-tarifário - (formato "EX-[número]")
Conferências:
• Máquina/Equipamento
• Marca - (se mercadoria é máquina ou equipamento)
• Modelo - (se mercadoria é máquina ou equipamento)
• Possui Ex-tarifário - (Sim/Não, sempre justificando)
• Multiplicação de valor unitário = quantidade comercializada de cada item
• Somatório dos itens = valor total informado
• Se INCOTERM de responsabilidade do exportador: Tipo de frete = "Prepaid"
• Se INCOTERM de responsabilidade do importador: Tipo de frete = "Collect"
`;

export const conferencesDefault = `
Conferências:
• Máquina/Equipamento
• Possui Ex-tarifário - (Sim/Não, sempre justificando)
• Valor total do frete - Fazer a somatória de todos os valores de frete encontrados no item 'frete' do checklist usando a ferramenta calculator, considere todos os totais (Ex: Total Prepaid, Total Collect) como parte do real valor total e os some com a ferramenta calculator
• Somatório Peso Líquido total - Considerando todas as páginas somar as informações relacionadas a peso líquido no documento usando o calculator ou extrair diretamente a informação caso já se encontre no documento. - (N.W)
• Somatório Peso Bruto total - Considerando todas as páginas somar as informações relacionadas a peso bruto total no documento e retornar o valor total usando a ferramenta calculator ou extrair diretamente a informação caso já se encontre no documento.- (G.W)`;

export const checklistCeMercante = `
• Navio - Campo "Código da Embarcação" em "Consulta de conhecimento"
• Número do conhecimento de embarque
• Data de emissão
• Cubagem - (m³/m3)
• Peso Bruto - (G.W)
• Porto de origem
• Porto de destino
• Dados do Consignatário - também chamado de Consignee, Importador, Importer, Ship To  (Razão social, endereço, CNPJ, CEP)
• Dados do Embarcador (Campo "Identificação do Exportador" em "Consulta de conhecimento")
• Dados do Notify - também chamado de Adquirente, Buyer, Sold to, Encomendante, Bill to, Notify Party (Razão social, endereço, CNPJ, CEP)
• Descrição da mercadoria - Campo "Descrição da mercadoria" em "Consulta de conhecimento"
• Frete - Todas as informações referentes a frete. Trazer tipo(Prepaid/Collect); moeda e valor (Total Prepaid; Total Collect; Total Freight, Basic Ocean Freight; Ocean Freight; O/F; OF; Freight; International freight; Freight and Charges, CAPATAZIA, THD). Trazer todas as informações que encontrar de forma detalhada, organizada com: Label, Tipo, moeda, valor. Traga uma string com todos estes dados. Não converta os atributos internos do frete para json.
• Taxas - valores, moedas e tipos
• Transbordo - navio 1º transporte - Campo "Navio do 1º Transporte" em "Consulta de conhecimento"
• Valor da Capatazia - THC, DTHC, THD, Terminal Handling Charge, Terminal Handling Charge Destination
• Tipos de carga - Campos "Tipo" em "Relação de itens da carga"
• Quantidade de containers por tipo - Traga os dados do container para todos os containers
• Dados dos containeres - Trazer todas as informações referentes à Relação de itens de carga mantendo o label das informações, separe cada container em uma linha, ou seja, reúna em <p></p> Começando em número do container e quebrando a linha sempre que houver outro Número de container, usando um ‘/n’, para poder iniciar outro paragrafo. Apenas as informações de um container por linha. Número do Container - (no formato <3 letras>U<7 números>); Número dos lacres dos containers - (seal); Peso Bruto; Cubagem; Tipo de carga. Traga uma string com todos estes dados. Não converta os atributos internos dos containers para json.`;

export const checklistCertificadoOrigem = `
• Dados do Exportador - (nome, endereço, NIF)
• Dados do Importador - também chamado de Consignee, Importer, Ship To (Razão social, endereço e CNPJ, CEP)
• Dados do Consignatário
• Dados do Adquirente
• Acordo
• Fatura Comercial
• Valor Total das mercadorias - Considerando todas as páginas faça a somatório do valor total informado por espécie de mercadoria usando a ferramenta calculator ou apenas recupere o valor total já informado no documento
• Valor unitário de cada espécie de mercadoria - Considerando todas as páginas é o valor unitário multiplicado pela quantidade das mercadorias(quantidade X valor unitário, separando mercadorias diferentes por ';')
• NCM
• NALADI/NALADISA - (pode ter de 8 a 12 dígitos)
Se operação por Conta e Ordem:
• Dados do Adquirente - também chamado de Notify, Buyer, Sold to, Encomendante, Bill to, Notify Party (Razão social, endereço, CNPJ, CEP) `;

export const checklistCommercialInvoice = `
• Número do documento
• Nome do documento
• Data do documento
• Dados do Importador - também chamado de Consignee, Importer, Ship To (Razão social, endereço e CNPJ, CEP)
• Dados do Adquirente - também chamado de Notify, Buyer, Sold to, Encomendante, Bill to, Notify Party (Razão social, endereço, CNPJ, CEP)
• Dados do Exportador - (nome, endereço, NIF)
• Dados do Fabricante - (nome, endereço, NIF)
• Assinatura
• Marca
• Numeração
• Descrição das mercadorias - (Trazer todos os nomes de produtos diferentes na descrição)
• Código/Referência das mercadorias
• Quantidade - (trazer no formato quantidade x mercadoria)
• Unidade Comercializada
• Valor unitário de cada espécie de mercadoria - Considerando todas as páginas é o valor unitário multiplicado pela quantidade das mercadorias(quantidade X valor unitário, separando mercadorias diferentes por ';')
• Valor Total de cada espécie de mercadoria - Considerando todas as páginas é o valor unitário multiplicado pela quantidade das mercadorias ou apenas o valor total já informado no documento (quantidade X valor unitário separando mercadorias diferentes por ';')
• Valor Total das Mercadorias - Considerando todas as páginas faça a somatório do valor total informado por espécie de mercadoria usando a ferramenta calculator ou apenas recupere o valor total já informado no documento
• Moeda de pagamento
• Condições de Pagamento
• Dados Bancários do Exportador
• Números do lote
• NCM/HS Code
• Porto de Embarque
• Porto de Desembarque
• País de Origem
• País Procedência
• País de Aquisição
• INCOTERM
• Local do INCOTERM
• Frete - Todas as informações referentes a frete. Trazer tipo(Prepaid/Collect); moeda e valor (Total Prepaid; Total Collect; Total Freight, Basic Ocean Freight; Ocean Freight; O/F; OF; Freight; International freight; Freight and Charges, CAPATAZIA, THD). Trazer todas as informações que encontrar de forma detalhada, organizada com: Label, Tipo, moeda, valor. Traga uma string com todos estes dados. Não converta os atributos internos do frete para json.
• Seguro (tipo, moeda e valor)
• Referência
• Forma/Condições de Pagamento - (true/false)
• Dados Bancários Exportador
• Valor do Seguro - (se prepaid)
• Peso Líquido - (N.W)
• Peso Bruto - (G.W)
• Quantidade de Volumes - pode ser um entre: crate, box, pallets, bags ou outro relacionado ao tema volume
• Tipo de Volumes - pode ser um entre: crate, box, pallets, bags ou outro relacionado ao tema volume
• Descrição EX-tarifário - (no formato "EX-[número]")
Se mercadoria é máquina ou equipamento
• Nº de Série
• Marca
• Modelo
Conferências:
• Importação direta - (Deve retornar true apenas se Adquirente for igual ao Importador, se não, false)
• Importação por Conta e Ordem - (Deve retornar true apenas se Adquirente for diferente ao Importador, se não, false)
• Multiplicação de valor unitário dos itens comercializados - (trazer no formato valor unitário x quantidade comercializada)
• Valor das mercadorias - (Somatório do valor total informado por espécie de mercadoria usando a ferramenta calculator)`;

export const checklistConhecimentoBL = `
• Número do documento
• Data
• Dados do Shipper - também chamado de Remetente (nome, endereço, CNPJ, CEP)
• Dados do Consignee - também chamado de Consignatário (Razão social, endereço e CNPJ, CEP)
• "To order of" - identificar se consta "To order of" junto ao consignee - (true/false)
• Dados do Notify - também chamado de Adquirente, Notify Party (Razão social, endereço, CNPJ, CEP)
• Navio - Campo "Vessel", também popde constar como "Vessel/Voyage"
• Tipo de carga - Identificar se FCL, LCL, FCL/LCL, Breakbulk, Bulk (granel);
• Quantidade e tipos de containers
• Números dos containers - (no formato <3 letras>U<7 números>)
• Números dos lacres dos containers - (seal)
• Peso Bruto por container
• Cubagem por container
• Quantidade e tipo de volumes - (crate/box/pallets)
• Peso bruto por tipo de volume
• Cubagem por tipo de volume
• Informação Wooden Packing - (Not applicable; Treated and Certified; Not-Treated and Not-Certified; Processed; N/A)
• Descrição resumida das mercadorias - (Trazer todos os nomes de produtos diferentes na descrição)
• Código/Referência das mercadorias
• Ordem de compra - também encontrado pelas siglas "OC" ou "PO", também pode constar como "Ordem de Compra", "Orden de compra", "Pedido de compra", "Purchase Order".
• NCM - (primeiros 4 dígitos)
• Frete - Todas as informações referentes a frete. Trazer tipo(Prepaid/Collect); moeda e valor (Total Prepaid; Total Collect; Total Freight, Basic Ocean Freight; Ocean Freight; O/F; OF; Freight; International freight; Freight and Charges, CAPATAZIA, THD). Trazer todas as informações que encontrar de forma detalhada, organizada com: Label, Tipo, moeda, valor. Traga uma string com todos estes dados. Não converta os atributos internos do frete para json.
• Taxas
• Carga Perigosa - Código Indicador
• Carga Perigosa - Classe
• Dados dos containeres - Trazer todas as informações referentes à containeres mantendo o label das informações, separe cada container em uma linha, ou seja, reúna em <p></p> Começando em número do container e quebrando a linha sempre que houver outro Número de container, usando um ‘/n’, para poder iniciar outro paragrafo. Apenas as informações de um container por linha. Número do Container - (no formato <3 letras>U<7 números>); Número dos lacres dos containers - (seal); Peso Bruto; Cubagem; Tipo de carga. Traga uma string com todos estes dados. Não converta os atributos internos dos containers para json.
• Valor da Capatazia - THC, DTHC, THD, Terminal Handling Charge, Terminal Handling Charge Destination
• Descrição EX-tarifário - (no formato "EX-[número]")
Se mercadoria é máquina ou equipamento
• Nº de Série
Conferências:
• Importação direta - (Deve retornar true apenas se o Notify for igual ao Consignee, se não, false)
• Importação por Conta e Ordem - (Deve retornar true apenas se Notify for diferente ao Consignee, se não, false)
• Se INCOTERM de responsabilidade do exportador:
Tipo de frete = "Prepaid"
• Se INCOTERM de responsabilidade do importador:
Tipo de frete = "Collect"
Dados de compliance:
• Número do Conhecimento de Embarque`;

export const checklistConhecimentoHawb = `
• Número do HAWB
• Data da emissão
• Número do MAWB/AWB associados
• Dados do Shipper - também chamado de Remetente (nome, endereço, CNPJ, CEP)
• País do Shipper
• Dados do Consignee - também chamado de Importador, Importer, Ship To (razão social, endereço e CNPJ, CEP)
• CNPJ do Consignee - (Consignatário/Identificação)
• "To order of"
• Notify - (razão social, endereço, CNPJ e CEP)
• Frete - Todas as informações referentes a frete. Trazer tipo(Prepaid/Collect); moeda e valor (Total Prepaid; Total Collect; Total Freight, Basic Ocean Freight; Ocean Freight; O/F; OF; Freight; International freight; Freight and Charges, CAPATAZIA, THD). Trazer todas as informações que encontrar de forma detalhada, organizada com: Label, Tipo, moeda, valor. Traga uma string com todos estes dados. Não converta os atributos internos do frete para json.
• Forma de pagamento do frete
• Aeroporto de Partida
• Aeroporto de Destino
• Moeda
• Quantidade de volumes - (crate/box/pallets)
• Peso Bruto - (G.W)
• Peso Taxado
• Cubagem - (m³/m3)
• Informação "Wooden Packing" - (Tipo usado: Not applicable; Treated and Certified; Not-Treated and Not-Certified; Processed; N/A)
• Final Destination - (Recinto aduaneiro de destino, se não constar, igual ao Airport of Destination)
• Descrição das mercadorias - (Trazer todos os nomes de produtos diferentes na descrição)
• NCM/HS Code
• Descrição Ex-tarifário
• Frete por peso - também chamado de "Weight Charge"
• Somatório frete e taxas - Considerando todas as páginas fazer a somatória do 'Valor total do frete' e taxas encontrados no checklist usando a ferramenta calculator

Se mercadoria é máquina ou equipamento
• Nº de Série
Dados de Compliance:
• Description of Goods - (Descrição resumida e completa das mercadorias)
• Forma de pagamento - (Collect/Prepaid, por peso/valor ou outros encargos)
`;

export const checklistConhecimentoMawb = `
• Dados do Shipper - também chamado de Remetente (nome, endereço, CNPJ, CEP)
• Dados do Consignee - também chamado de Importador, Importer, Ship To (Razão social, endereço e CNPJ, CEP)
• Dados do Notify - também chamado de Adquirente, Buyer, Sold to, Encomendante, Bill to, Notify Party (Razão social, endereço, CNPJ, CEP)
• Aeroporto de Partida
• Aeroporto de Destino
• Peso Bruto - (G.W)
• Peso Taxado
• Quantidade de Volumes - (crate/box/pallets)
• Informação Wooden Packing - (Tipo usado: Not applicable; Treated and Certified; Not-Treated and Not-Certified; Processed; N/A)
• Descrição resumida das mercadorias - (Trazer todos os nomes de produtos diferentes na descrição)
• Frete - Todas as informações referentes a frete. Trazer tipo(Prepaid/Collect); moeda e valor (Total Prepaid; Total Collect; Total Freight, Basic Ocean Freight; Ocean Freight; O/F; OF; Freight; International freight; Freight and Charges, CAPATAZIA, THD). Trazer todas as informações que encontrar de forma detalhada, organizada com: Label, Tipo, moeda, valor. Traga uma string com todos estes dados. Não converta os atributos internos do frete para json.

Se mercadoria é máquina ou equipamento
• Nº de Série
• Se INCOTERM de responsabilidade do exportador:
Tipo de frete = "Prepaid"
• Se INCOTERM de responsabilidade do importador:
Tipo de frete = "Collect"`;

export const checklistCRT = `
• Número do Documento
• Dados do Remetente - também chamado de Shipper (nome, endereço, CNPJ, CEP)
• Dados do Consignatário - também chamado de Consignee, Importer, Ship To (Razão social, endereço e CNPJ, CEP)
• Dados do Destinatário - (razão social, endereço, CNPJ e CEP)
• Notificar
• Nome e endereço do transportador
• Local de embarque
• Local de Destino Final
• Quantidade de Volumes - (crate/box/pallets)
• Tipo de Volumes - (crate/box/pallets)
• Informação Wooden Packing - (Valores: Not applicable; Treated and Certified; Not-Treated and Not-Certified; Processed)
• Descrição resumida das mercadorias - (Trazer todos os nomes de produtos diferentes na descrição)
• Código/Referência das mercadorias
• NCM - (4 dígitos a 8 dígitos de cada NCM)
• Ordem de compra - também encontrado pelas siglas "OC" ou "PO", também pode constar como "Ordem de Compra", "Orden de compra", "Pedido de compra", "Purchase Order".
• Fatura Comercial - normalmente consta como "factura"/"factura comercial"/"factura e"/"factura de exportacion"/"fat.coml"
• Peso Bruto - (G.W)
• Peso Líquido - (N.W)
• Cubagem - (m³/m3)
• INCOTERM
• Valor da Mercadoria
• Valor do Frete - Todas as informações referentes a frete. Trazer tipo(Prepaid/Collect); moeda e valor (Total Prepaid; Total Collect; Total Freight, Basic Ocean Freight; Ocean Freight; O/F; OF; Freight; International freight; Freight and Charges, CAPATAZIA, THD). Trazer todas as informações que encontrar de forma detalhada, organizada com: Label, Tipo, moeda, valor. Traga uma string com todos estes dados. Não converta os atributos internos do frete para json.
• Seguro (tipo, moeda e valor)
• Outros gastos a pagar (tipo, moeda e valor)
• Valor do frete externo
• Declaração valor das mercadorias (valor por extenso)
• Documentos anexos
• Declarações e observações - detalhamento do frete internacional e nacional 
• Carimbo e assinatura
• Valor unitário de cada espécie de mercadoria - Considerando todas as páginas é o valor unitário multiplicado pela quantidade das mercadorias(quantidade X valor unitário, separando mercadorias diferentes por ';')
• Descrição EX-tarifário - (true/false)

Se mercadoria é máquina ou equipamento
• Nº de Série

Conferências:
• Valor total do frete - Fazer a somatória de todos os valores de frete encontrados no item 'frete' do checklist usando a ferramenta calculator, considere todos os totais (Ex: Total Prepaid, Total Collect) como parte do real valor total e os some com a ferramenta calculator
• Importação direta - (Deve retornar true apenas se Destinatário for igual ao Consignatário, se não, false)
• Importação por Conta e Ordem - (Deve retornar true apenas se Destinatário for diferente ao Consignatário, se não, false)

• Se INCOTERM de responsabilidade do exportador:
    Tipo de frete = "Prepaid"
• Se INCOTERM de responsabilidade do importador:
    Tipo de frete = "Collect"

• Documentos anexos - D.E. Estrangeira - consta "destinácion" ou "permiso de exportacion"`;

export const checklistPackingList = `
• Ordem de compra - também encontrado pelas siglas "OC" ou "PO", também pode constar como "Ordem de Compra", "Orden de compra", "Pedido de compra", "Purchase Order".
• Fatura Comercial
• Dados do Importador - também chamado de Consignee, Importer, Ship To (Razão social, endereço e CNPJ, CEP)
• Dados do Adquirente ou Encomendante - também chamado de Notify, Buyer, Sold to, Encomendante, Bill to, Notify Party (Razão social, endereço, CNPJ, CEP)
• Dados do Exportador - (nome, endereço, NIF)
• Descrição das mercadorias - (Trazer todos os nomes de produtos diferentes na descrição)
• Código/Referência das mercadorias
• Quantidade de Volumes - (crate/box/pallets)
• Tipo de Volumes - (crate/box/pallets)
• Peso Líquido por volume ou unidade
• Somatório Peso Líquido total - Considerando todas as páginas somar as informações relacionadas a peso líquido no documento e retornar o valor total usando a ferramenta calculator - (N.W)
• Somatório Peso Bruto total - Considerando todas as páginas somar as informações relacionadas a peso bruto total no documento e retornar o valor total usando a ferramenta calculator - (G.W)
• Somatório Cubagem total -Considerando todas as páginas somar as informações relacionadas a cubagem no documento e retornar o valor total usando a ferramenta calculator - (m³/m3)
`;

export const ChecklistProformaInvoice = `
• Número do documento
• Nome do documento
• Data do documento
• Assinatura
• Dados do Importador - também chamado de Consignee, Importer, Ship To (Razão social, endereço e CNPJ, CEP) - Em casos em que não está esplicitamente indicado, os primeiros dados que constam no documento são considerados como dados do importador.
• Dados do Adquirente - também chamado de Notify, Buyer, Sold to, Encomendante, Bill to, Notify Party (Razão social, endereço, CNPJ, CEP)
• Dados do Exportador - (nome, endereço, NIF)
• Ordem de compra - também encontrado pelas siglas "OC" ou "PO", também pode constar como "Ordem de Compra", "Orden de compra", "Pedido de compra", "Purchase Order".
• País de origem
• Descrição das mercadorias - (Trazer todos os nomes de produtos diferentes na descrição)
• Código/Referência das mercadorias
• Quantidade - (trazer no formato quantidade x mercadoria)
• Unidade comercializada
• Valor unitário de cada espécie de mercadoria - Considerando todas as páginas é o valor unitário multiplicado pela quantidade das mercadorias(quantidade X valor unitário, separando mercadorias diferentes por ';')
• Valor Total de cada espécie de mercadoria - Considerando todas as páginas é o valor unitário multiplicado pela quantidade das mercadorias ou apenas o valor total já informado no documento (quantidade X valor unitário separando mercadorias diferentes por ';')
• Valor Total das Mercadorias - (Considerando todas as páginas faça a somatório do valor total informado por espécie de mercadoria usando a ferramenta calculator ou apenas recupere o valor total já informado no documento)
• NCM/HS Code
• Moeda de pagamento
• Forma/Condições de Pagamento
• Dados bancários do exportador - (true/false)
• INCOTERM
• Local do INCOTERM
• Peso estimado
• Quantidade de volumes estimada - (crate/box/pallets)
• Dimensão estimada dos volumes - (referente a crate/box/pallets) (volume x altura x largura)
Conferências:
• Valor total do frete - Fazer a somatória de todos os valores de frete encontrados no item 'frete' do checklist usando a ferramenta calculator, considere todos os totais (Ex: Total Prepaid, Total Collect) como parte do real valor total e os some com a ferramenta calculator
• Somatório Peso Líquido total - Considerando todas as páginas somar as informações relacionadas a peso líquido no documento e retornar o valor total usando a ferramenta calculator - (N.W)
• Somatório Peso Bruto total - Considerando todas as páginas somar as informações relacionadas a peso bruto total no documento e retornar o valor total usando a ferramenta calculator - (G.W)
• Multiplicação de valor unitário dos itens comercializados -  (Trazer as mercadorias no formato valor unitário x quantidade comercializada)
• Valor Total das Mercadorias - (Considerando todas as páginas faça a somatório do valor total informado por espécie de mercadoria usando a ferramenta calculator ou apenas recupere o valor total já informado no documento)
• Máquina/Equipamento`;

const checklistCCTAereo = `
• Identificação do conhecimento de carga - (número do HAWB)
• Data/hora da emissão
• Identificação para vinculação a DI/DSI eletrônica/DTA/e-DMOV
• Aeroporto de partida
• Aeroporto de destino
• Recinto aduaneiro de destino
• Quantidade de volumes - (crate/box/pallets)
• Peso bruto - (G.W)
• Presença de peças de madeira maciça - Se "Wooden Packing : not applicable" no HAWB - Não; Se "Wooden Packing : Treated and Certified" no HAWB - Sim; Se "Wooden Packing : Not-Treated and Not-Certified" - Sim; Se "Wooden Packing : Processed" - Sim.
• Descrição resumida das mercadorias - (Trazer todos os nomes de produtos diferentes na descrição)
• Moeda de origem
• Frete por item de carga - (somatório)
• Forma de pagamento - (por peso/valor)
• Forma de pagamento - (outros encargos)
• Dados do Embarcador estrangeiro - também chamado de exportador (nome, endereço, CNPJ, CEP)
• País do embarcador estrangeiro
• Consignatário/Identificação - (CNPJ)
• Dados do Consignatário - também chamado de Consignee, Importer, Ship To (Razão social, endereço e CNPJ, CEP)
• Número do MAWB/AWB associados

Conferências:
• Valor total do frete - Fazer a somatória de todos os valores de frete encontrados no item 'frete' do checklist usando a ferramenta calculator, considere todos os totais (Ex: Total Prepaid, Total Collect) como parte do real valor total e os some com a ferramenta calculator
• Somatório Peso Líquido total - Considerando todas as páginas somar as informações relacionadas a peso líquido no documento e retornar o valor total usando a ferramenta calculator - (N.W)
• Somatório Peso Bruto total - Considerando todas as páginas somar as informações relacionadas a peso bruto total no documento e retornar o valor total usando a ferramenta calculator - (G.W)
`;

const checklistMicDta = `
• Número do documento
• Data de emissão
• Dados do Remetente - também chamado de Shipper (nome, endereço, CNPJ, CEP)
• Dados do Consignatário - também chamado de Consignee, Importer, Ship To (Razão social, endereço e CNPJ, CEP)
• Dados do Destinatário - também chamado de Buyer (se importação por Conta e Ordem ou por Encomenda)
• Nome e endereço do transportador
• Local de Embarque
• Local de Destino Final
• Placa do Veículo
• Placa do reboque/semireboque
• Placa do veículo substituto
• Placa do reboque/semireboque substituto
• Número do CRT
• Aduana de destino
• País de origem
• Moeda da mercadoria
• Valor da mercadoria - FOT
• Valor do Frete - Todas as informações referentes a frete. Trazer tipo(Prepaid/Collect); moeda e valor (Total Prepaid; Total Collect; Total Freight, Basic Ocean Freight; Ocean Freight; O/F; OF; Freight; International freight; Freight and Charges, CAPATAZIA, THD). Trazer todas as informações que encontrar de forma detalhada, organizada com: Label, Tipo, moeda, valor. Traga uma string com todos estes dados. Não converta os atributos internos do frete para json.
• Valor do seguro
• Tipo de Volumes - (crate/box/pallets)
• Quantidade de Volumes - (crate/box/pallets)
• Peso Bruto - (G.W)
• Peso liquido - (N.W)
• Documentos Anexos
• Informação Wooden Packing - (Valores: Not applicable; Treated and Certified; Not-Treated and Not-Certified; Processed)
• Descrição resumida das mercadorias - (Trazer todos os nomes de produtos diferentes na descrição)
• Código/Referência das mercadorias
• NCM - (4 dígitos a 8 dígitos de cada NCM)
• Ordem de compra - também encontrado pelas siglas "OC" ou "PO", também pode constar como "Ordem de Compra", "Orden de compra", "Pedido de compra", "Purchase Order".
• Fatura Comercial - normalmente consta como "factura"/"factura comercial"/"factura e"/"factura de exportacion"/"fat.coml"
• Assinatura
• Descrição EX-tarifário - (true/false)

Se mercadoria é máquina ou equipamento
• Nº de Série

Conferências:
• Importação direta - (Deve retornar true apenas se Destinatário for igual ao Consignatário, se não, false)
• Importação por Conta e Ordem - (Deve retornar true apenas se Destinatário for diferente do Consignatário, se não, false)`;

export const checklistLabels = `
• Denominação - (VINHO TIPO + COR + AÇÚCAR, nesta ordem, exceto para VINHO MOSCATO ESPUMANTE ou VINHO MOSCATEL ESPUMANTE)
• Produzido e engarrafado por - (NOME, ENDEREÇO, REGISTRO JUNTO AO MAPA, se houver)
• Dados do exportador - (opcional) (NOME / ENDEREÇO / REGISTRO JUNTO AO MAPA, se houver)
• Dados do importador - (NOME / ENDEREÇO COMPLETO / CNPJ / Registro no MAPA)
• Distribuidor - (opcional) (NOME / ENDEREÇO COMPLETO / CNPJ / Registro no MAPA)
• Ingredientes e aditivos alimentares - (Exemplo: "Ingredientes: elaborado com uvas viníferas, conservador anidrido sulfuroso (INS 220)")
• Prazo de validade e conservação do produto - (Exemplo: "Prazo de validade indeterminado desde que conservado em local seco e ao abrigo da luz, preferencialmente na posição horizontal")
• Conteúdo líquido - (A indicação quantitativa pode ser precedida das declarações "Peso líquido" ou "Conteúdo líquido")
• Graduação alcoólica - (Exemplo: "13,5% Vol.")
• Safra - (opcional) (Permitida a indicação da safra para vinhos feitos com uvas de 85% da safra indicada)
• País de origem - (Informar o país de origem)
• EVITE O CONSUMO EXCESSIVO DE ÁLCOOL
• "NÃO CONTÉM GLÚTEN"
• "PROIBIDA A VENDA PARA MENORES DE 18 ANOS"
• Lote - (Exemplo: "Lote: XXXXX. Lote: vide garrafa")
• Marca - (Incluir a marca do produto)
• Símbolo de Grávida com o "/" de proibido 
• Símbolo de retorno/reciclável`;

export const checklistAnaliseDeVinhos = `
• Usuário deve informar qual é o tipo de vinho - (não consta no certificado de análise)
• Número de lote - ("Lote: XXXX”, "Lote No. XXXX", "L-XXXX")
• Descrição do produto - (pode variar, não exatamente igual à proforma)
• Embalagem - (Exemplo: garrafa 750ml; botella 750 c.c.)
• Origem Geográfica - ("Denominação de Origem")
• Parâmetros obrigatórios de acordo com o tipo de vinho - (COLUNA "Laudo estrangeiro (Certificado de Origem)") (Aqui, além de verificar se o parâmetro consta, a solução deve verificar se o valor do parâmetro está dentro do permitido para o tipo de vinho, de acordo com a tabela)
• Parâmetros não obrigatórios de acordo com o tipo de vinho - (Aqui, além de verificar se o parâmetro consta, a solução deve verificar se o valor do parâmetro está dentro do permitido para o tipo de vinho, de acordo com a tabela)
• Aditivos Alimentares - (Aqui, além de verificar se consta o aditivo, a solução deve verificar se o valor está dentro do permitido para o tipo de vinho, de acordo com a tabela)`;

export const checklistRotulosEContrarrotulosVinhos = `
• Denominação - (VINHO TIPO + COR + AÇÚCAR, nesta ordem, exceto para VINHO MOSCATO ESPUMANTE ou VINHO MOSCATEL ESPUMANTE)
• Produzido e engarrafado por - (NOME, ENDEREÇO, REGISTRO JUNTO AO MAPA, se houver)
• Dados do Exportador - (opcional) (NOME / ENDEREÇO / REGISTRO JUNTO AO MAPA, se houver)
• Dados do Importador - (NOME / ENDEREÇO COMPLETO / CNPJ / Registro no MAPA)
• Distribuidor - (opcional) (NOME / ENDEREÇO COMPLETO / CNPJ / Registro no MAPA)
• Ingredientes e aditivos alimentares - (Exemplo: “Ingredientes: elaborado com uvas viníferas, conservador anidrido sulfuroso (INS 220)”)
• Prazo de validade e conservação do produto - (Exemplo: “Prazo de validade indeterminado desde que conservado em local seco e ao abrigo da luz, preferencialmente na posição horizontal”)
• Conteúdo líquido - (A indicação quantitativa pode ser precedida das declarações “Peso líquido” ou “Conteúdo líquido”)
• Graduação alcoólica - (Exemplo: “13,5% Vol.”)
• Safra - (opcional) (Permitida a indicação da safra para vinhos feitos com uvas de 85% da safra indicada)
• País de origem - (Informar o país de origem)
• EVITE O CONSUMO EXCESSIVO DE ÁLCOOL
• “NÃO CONTÉM GLÚTEN”
• “PROIBIDA A VENDA PARA MENORES DE 18 ANOS”
• Lote - (Exemplo: “Lote: XXXXX. Lote: vide garrafa”)
• Marca - (Incluir a marca do produto)
• Símbolo de Grávida com o “r” de proibido
• Símbolo de retorno/reciclável`;

export const checklistOrdemDeCompra = `
• Nome do documento
• Data do documento
• Número da ordem da compra
• Dados do emissor do documento(Adquirente/Notify/Destinatário) - (Razão social, endereço e CNPJ)
• Dados do Importador - (Razão social, endereço e CNPJ)
• Dados do Exportador/Fornecedor - (Razão social, endereço e CNPJ) - Buscar também por "importação por conta e ordem" ou "importação por encomenda".
• Descrição das mercadorias
• Quantidade
• Unidade Comercializada
• Valor unitário de cada espécie de mercadoria - Considerando todas as páginas é o valor unitário multiplicado pela quantidade das mercadorias(quantidade X valor unitário, separando mercadorias diferentes por ';')
• Valor Total de cada espécie de mercadoria - Considerando todas as páginas é o valor unitário multiplicado pela quantidade das mercadorias ou apenas o valor total já informado no documento (quantidade X valor unitário separando mercadorias diferentes por ';')
• Valor Total das Mercadorias - Considerando todas as páginas faça a somatório do valor total informado por espécie de mercadoria usando a ferramenta calculator ou apenas recupere o valor total já informado no documento
• Moeda de pagamento
• Condições de pagamento
• INCOTERM
• Local do INCOTERM`;

export const checklistInstrucaoDeEmbarque = `
• Dados do Exportador/Shipper - (Razão social, endereço e CNPJ)
• Dados do Consignatário - (Razão social, endereço e CNPJ)
• Dados do Notify/Destinatário - (Razão social, endereço e CNPJ)
• Ordem de compra - também encontrado pelas siglas "OC" ou "PO", também pode constar como "Ordem de Compra", "Orden de compra", "Pedido de compra", "Purchase Order".
• Local de Embarque
• Local de Desembarque
• Quantidade e tipo de containers
• Quantidade e tipo de volumes
• Peso Bruto - (G.W)
• Cubagem - (m³/m3)
• NCMs
• Descrição das mercadorias`;

export const checklistCertificadoDeAnalise = `
• Dados do Shipper/Exportador - (Razão social, endereço e CNPJ)
• Dados do Importador/Consignatário - (Razão social, endereço e CNPJ)
• Dados do Adquirente/Encomendante/Destinatário - (Razão social, endereço e CNPJ)
• Código/Referência da mercadoria
• Descrição das mercadorias
• Números de lote
• Quantidade
• Peso líquido - (N.W)
• Ordem de compra - também encontrado pelas siglas "OC" ou "PO", também pode constar como "Ordem de Compra", "Orden de compra", "Pedido de compra", "Purchase Order".
• Fatura comercial`;

export const checklistCertificadoFitossanitario = `
• Número
• Dados do Exportador - (Razão social, endereço e CNPJ)
• Dados do Consignatário/Importador - (Razão social, endereço e CNPJ)
• "To Plant Protection Organization of"
• Local de origem
• Descrição das mercadorias
• Quantidade
• Tratamento
• Duração e temperatura
• Data
• Assinatura`;

export const checklistAnexoVII = `
• Expedidor/notificante (Exportador/Shipper)
• Consignatário
• Número do B/L
• Porto de Carga
• Porto de Descarga
• Número dos containers
• Descrição da mercadoria
• Peso Bruto - (G.W)
• Peso Líquido - (N.W)
• Quantidade e tipo de volumes
• Carga perigosa - Código Indicador (UN)
• Carga perigosa - Classe
• Carga perigosa - Package group
• Data
• Assinatura`;

export const checklistFichaDeEmergencia = `
• Emissor do documento (Adquirente/Notify)
• Descrição das mercadorias
• Carga perigosa - Código Indicador (UN)
• Carga perigosa - Classe
• Carga perigosa - Package group`;

export const checklistMSDS = `
• Emissor do documento (Adquirente/Notify)
• Descrição das mercadorias
• Carga perigosa - Código Indicador (UN)
• Carga perigosa - Classe
• Carga perigosa - Package group`;

export const checklistCotacaoDeFrete = `
• Mercadorias/Commodity
• INCOTERM
• Quantidade e tipo de containers
• Quantidade e tipo de volumes
• Cubagem - (m³/m3)
• Peso Bruto
• Peso Taxado
• Custos totais na origem (Moeda e valor) - também encontrado como "Total custos na origem" ou "Custos totais origem"
• Custos totais de frete (Moeda e valor) - também encontrado como "Total do frete marítimo", "Total do frete aéreo", "Total do frete rodoviário", "Total custos no frete", "Custos totais frete" ou "Frete Total"
• Capatazia (Moeda e valor) - também consta como "Capatazia (DTHC)", "Destination Terminal Handling Charges" ou "THC no Destino (Capatazia)"
• Frete - Somatória dos valores da capatazia, custos totais de frete e custos totais na origem
`;

export enum DocumentTypes {
  PROFORMA_INVOICE = 'PROFORMA INVOICE',
  COMMERCIAL_INVOICE = 'COMMERCIAL INVOICE',
  DOCUMENTO_SEM_CHECKLIST = 'DOCUMENTO SEM CHECKLIST',
  PACKING_LIST = 'PACKING LIST',
  CONHECIMENTO_BL = 'CONHECIMENTO - B/L',
  CONHECIMENTO_HAWB = 'HAWB',
  CONHECIMENTO_MAWB = 'CONHECIMENTO - MAWB',
  CONHECIMENTO_CRT = 'CONHECIMENTO - CRT',
  CONHECIMENTO_MIC_DTA = 'CONHECIMENTO - MIC/DTA',
  CE_MERCANTE = 'CE MERCANTE',
  CCT = 'CCT AÉREO',
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
  CERTIFICADO_DE_ANALISE_DE_VINHOS = 'CERTIFICADO DE ANÁLISE DE VINHOS',
  COTACAO_DE_FRETE = 'COTAÇÃO DE FRETE',
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
  'ORDEM[_-\\s]DE[_-\\s]COMPRA[_-\\s]DO[_-\\s]IMPORTADOR|PURCHASE[_-\\s]ORDER|\\bPO\\b': DocumentTypes.ORDEM_DE_COMPRA_DO_IMPORTADOR,
  'SALES[_-\\s]ORDER[_-\\s]DOCUMENT|SALES[_-\\s]ORDER[_-\\s]ACKNOWLEDGMENT': DocumentTypes.SALES_ORDER_DOCUMENT,
  'CONFIRMATION[_-\\s]OF[_-\\s]ORDER': DocumentTypes.CONFIRMATION_OF_ORDER,
  'CERTIFICADO[_-\\s]DE[_-\\s]ORIGEM[_-\\s]DIGITAL': DocumentTypes.CERTIFICADO_DE_ORIGEM_DIGITAL,
  'CERTIFICADO[_-\\s]DE[_-\\s]ORIGEM': DocumentTypes.CERTIFICADO_DE_ORIGEM,
  'CERTIFICADO[_-\\s]DE[_-\\s]ANALISE.*VINHO(S?)?': DocumentTypes.CERTIFICADO_DE_ANALISE_DE_VINHOS,
  'TEST[_-\\s]REPORT|LABORATORY[_-\\s]REPORT|CERTIFICADO[_-\\s]DE[_-\\s]ANALISE(?!.*VINHO)': DocumentTypes.TEST_REPORT,
  'LABEL(?:S)?|(?:CONTRA[_\\-\\sR])?ROTULO(?:S)?': DocumentTypes.LABELS,
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
  'COTACAO[_-\\s]DE[_-\\s]FRETE/i': DocumentTypes.COTACAO_DE_FRETE,
};

export const checklistTypeMapping = {
  [DocumentTypes.PROFORMA_INVOICE]: ChecklistProformaInvoice,
  [DocumentTypes.COMMERCIAL_INVOICE]: checklistCommercialInvoice,
  [DocumentTypes.PACKING_LIST]: checklistPackingList,
  [DocumentTypes.CONHECIMENTO_BL]: checklistConhecimentoBL,
  [DocumentTypes.CONHECIMENTO_HAWB]: checklistConhecimentoHawb,
  [DocumentTypes.CONHECIMENTO_MAWB]: checklistConhecimentoMawb,
  [DocumentTypes.CONHECIMENTO_CRT]: checklistCRT,
  [DocumentTypes.CE_MERCANTE]: checklistCeMercante,
  [DocumentTypes.CERTIFICADO_DE_ORIGEM]: checklistCertificadoOrigem,
  [DocumentTypes.DOWNPAYMENT_INVOICE]: ChecklistProformaInvoice,
  [DocumentTypes.CCT]: checklistCCTAereo,
  [DocumentTypes.CONHECIMENTO_MIC_DTA]: checklistMicDta,
  [DocumentTypes.LABELS]: checklistLabels,
  [DocumentTypes.CERTIFICADO_DE_ANALISE_DE_VINHOS]: checklistAnaliseDeVinhos,
  [DocumentTypes.SALES_ORDER_DOCUMENT]: checklistOrdemDeCompra,
  [DocumentTypes.INSTRUCAO_DE_EMBARQUE]: checklistInstrucaoDeEmbarque,
  [DocumentTypes.TEST_REPORT]: checklistCertificadoDeAnalise,
  [DocumentTypes.CERTIFICADO_FITOSSANITARIO]: checklistCertificadoFitossanitario,
  [DocumentTypes.ANEXO_VII]: checklistAnexoVII,
  [DocumentTypes.FICHA_DE_EMERGENCIA]: checklistFichaDeEmergencia,
  [DocumentTypes.MSDS]: checklistMSDS,
  [DocumentTypes.COTACAO_DE_FRETE]: checklistCotacaoDeFrete,
};

export const documentPriorityMapping = {
  [DocumentTypes.PROFORMA_INVOICE.toString()]: 2,
  [DocumentTypes.COMMERCIAL_INVOICE.toString()]: 3,
  [DocumentTypes.DOCUMENTO_SEM_CHECKLIST.toString()]: 0,
  [DocumentTypes.PACKING_LIST.toString()]: 4,
  [DocumentTypes.CONHECIMENTO_BL.toString()]: 6,
  [DocumentTypes.CONHECIMENTO_HAWB.toString()]: 6,
  [DocumentTypes.CONHECIMENTO_MAWB.toString()]: 6,
  [DocumentTypes.CONHECIMENTO_CRT.toString()]: 6,
  [DocumentTypes.CONHECIMENTO_MIC_DTA.toString()]: 7,
  [DocumentTypes.CE_MERCANTE.toString()]: 7,
  [DocumentTypes.CCT.toString()]: 7,
  [DocumentTypes.INSTRUCAO_DE_EMBARQUE.toString()]: 5,
  [DocumentTypes.DUIMP.toString()]: 0,
  [DocumentTypes.DUE.toString()]: 0,
  [DocumentTypes.DECLARACAO_DE_IMPORTACAO.toString()]: 0,
  [DocumentTypes.RESUMO_DA_DECLARACAO_DE_IMPORTACAO.toString()]: 0,
  [DocumentTypes.LICENCA_DE_IMPORTACAO.toString()]: 0,
  [DocumentTypes.LPCO.toString()]: 0,
  [DocumentTypes.DOWNPAYMENT_INVOICE.toString()]: 2,
  [DocumentTypes.PROPOSTA.toString()]: 1,
  [DocumentTypes.ORDEM_DE_COMPRA_DO_IMPORTADOR.toString()]: 1,
  [DocumentTypes.SALES_ORDER_DOCUMENT.toString()]: 1,
  [DocumentTypes.CONFIRMATION_OF_ORDER.toString()]: 1,
  [DocumentTypes.CERTIFICADO_DE_ORIGEM_DIGITAL.toString()]: 8,
  [DocumentTypes.CERTIFICADO_DE_ORIGEM.toString()]: 8,
  [DocumentTypes.TEST_REPORT.toString()]: 9,
  [DocumentTypes.LABELS.toString()]: 10,
  [DocumentTypes.ANEXO_IX.toString()]: 0,
  [DocumentTypes.ANEXO_XI.toString()]: 0,
  [DocumentTypes.CERTIFICADO_DE_INSPECAO.toString()]: 0,
  [DocumentTypes.CERTIFICADO_DE_CONFORMIDADE_ORGANICA.toString()]: 0,
  [DocumentTypes.DECLARACAO_DE_TRANSACAO_COMERCIAL.toString()]: 0,
  [DocumentTypes.ATESTADO_DE_INEXISTENCIA_DE_PRODUCAO_ESTADUAL.toString()]: 0,
  [DocumentTypes.CATALOGO_DE_EQUIPAMENTO.toString()]: 0,
  [DocumentTypes.CERTIFICADO_DE_COMPLIANCE.toString()]: 0,
  [DocumentTypes.CERTIFICADO_DE_ESTERILIZACAO.toString()]: 0,
  [DocumentTypes.DECLARACAO_DO_DETENTOR_DA_REGULARIZACAO.toString()]: 0,
  [DocumentTypes.MSDS.toString()]: 0,
  [DocumentTypes.FICHA_DE_EMERGENCIA.toString()]: 0,
  [DocumentTypes.FISPQ.toString()]: 0,
  [DocumentTypes.SHIPPERS_DECLARATION.toString()]: 0,
  [DocumentTypes.ANEXO_VII.toString()]: 0,
  [DocumentTypes.FICHA_DE_LOTE.toString()]: 0,
  [DocumentTypes.CERTIFICADO_FITOSSANITARIO.toString()]: 0,
  [DocumentTypes.CERTIFICADO_DE_ANALISE_DE_VINHOS.toString()]: 9,
  [DocumentTypes.COTACAO_DE_FRETE.toString()]: 0,
};

export const sortUploadFiles = (uploadFiles: FileMapping[]): FileMapping[] => {
  return uploadFiles.sort((a, b) => {
    const priorityA = documentPriorityMapping[a.type] || Infinity;
    const priorityB = documentPriorityMapping[b.type] || Infinity;

    if (priorityA === 0 && priorityB !== 0) return 1;
    if (priorityB === 0 && priorityA !== 0) return -1;

    return priorityA - priorityB;
  });
};

export const identifyDocumentChecklist = (documentType: keyof typeof DocumentTypes) => {
  if (documentType in checklistTypeMapping) {
    return checklistTypeMapping[documentType as keyof typeof checklistTypeMapping];
  }
  return null;
};

export const identifyDocumentType = (fileName: string) => {
  for (const [regex, type] of Object.entries(documentNameAndTypeMapping)) {
    if (new RegExp(regex, 'i').test(removeAccents(fileName))) {
      return type as keyof typeof DocumentTypes;
    }
  }
  return null;
};

export const removeAccents = (text: string) => {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};
