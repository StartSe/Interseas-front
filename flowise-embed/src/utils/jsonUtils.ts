export enum customBooleanValues {
  NOT_FOUND = 'Não consta',
  FOUND = 'Consta',
}

export function sanitizeJson<T>(json: T): T {
  const sanitizedJson = { ...json };

  for (const key in sanitizedJson) {
    const keyValue = sanitizedJson[key];

    if (isObject(keyValue)) {
      sanitizedJson[key] = sanitizeJson(keyValue);
    } else if (keyValue === 'true' || keyValue === true) {
      (sanitizedJson[key] as any) = customBooleanValues.FOUND;
    } else if (keyValue === 'false' || keyValue === false) {
      (sanitizedJson[key] as any) = customBooleanValues.NOT_FOUND;
    } else if (shouldReplaceWithNull(keyValue)) {
      (sanitizedJson[key] as any) = null;
    }
  }

  return sanitizedJson;
}

function isObject(keyValue: any): boolean {
  return typeof keyValue === 'object' && keyValue !== null;
}

function shouldReplaceWithNull(keyValue: any): boolean {
  if (keyValue === null) {
    return false;
  }

  if (typeof keyValue === 'boolean') {
    return false;
  }

  return ['n/a', 'null', 'undefined', ''].includes(keyValue.toLowerCase());
}

export const normalizeLocationNames = (input: string): string => {
  const stateMap: { [key: string]: string } = {
    ACRE: 'AC',
    ALAGOAS: 'AL',
    AMAPA: 'AP',
    AMAZONAS: 'AM',
    BAHIA: 'BA',
    CEARA: 'CE',
    'DISTRITO FEDERAL': 'DF',
    'ESPIRITO SANTO': 'ES',
    GOIAS: 'GO',
    MARANHAO: 'MA',
    'MATO GROSSO': 'MT',
    'MATO GROSSO DO SUL': 'MS',
    'MINAS GERAIS': 'MG',
    PARA: 'PA',
    PARAIBA: 'PB',
    PARANA: 'PR',
    PERNAMBUCO: 'PE',
    PIAUI: 'PI',
    'RIO DE JANEIRO': 'RJ',
    'RIO GRANDE DO NORTE': 'RN',
    'RIO GRANDE DO S UL': 'RS',
    RONDONIA: 'RO',
    RORAIMA: 'RR',
    'SANTA CATARINA': 'SC',
    'SAO PAULO': 'SP',
    SERGIPE: 'SE',
    TOCANTINS: 'TO',
  };

  const removeAccents = (str: string) =>
    str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  const normalizedInput = removeAccents(input);

  return stateMap[normalizedInput] || input;
};

const countryPatterns: { [key: string]: RegExp } = {
  Afeganistão: /^(Afghanistan|AFG)$/i,
  'África do Sul': /^(South Africa|ZAF)$/i,
  Albânia: /^(Albania|ALB)$/i,
  Alemanha: /^(Germany|GER)$/i,
  Andorra: /^(Andorra|AND)$/i,
  Angola: /^(Angola|AGO)$/i,
  'Antígua e Barbuda': /^(Antigua and Barbuda|ATG)$/i,
  'Arábia Saudita': /^(Saudi Arabia|SAU)$/i,
  Argélia: /^(Algeria|DZA)$/i,
  Argentina: /^(Argentina|ARG)$/i,
  Armênia: /^(Armenia|ARM)$/i,
  Austrália: /^(Australia|AUS)$/i,
  Áustria: /^(Austria|AUT)$/i,
  Azerbaijão: /^(Azerbaijan|AZE)$/i,
  Bahamas: /^(Bahamas|BHS)$/i,
  Bahrein: /^(Bahrain|BHR)$/i,
  Bangladesh: /^(Bangladesh|BGD)$/i,
  Barbados: /^(Barbados|BRB)$/i,
  Belarus: /^(Belarus|BLR)$/i,
  Bélgica: /^(Belgium|BEL)$/i,
  Belize: /^(Belize|BLZ)$/i,
  Benin: /^(Benin|BEN)$/i,
  Butão: /^(Bhutan|BTN)$/i,
  Bolívia: /^(Bolivia|BOL)$/i,
  'Bósnia e Herzegovina': /^(Bosnia and Herzegovina|BIH)$/i,
  Botsuana: /^(Botswana|BWA)$/i,
  Brasil: /^(Brazil|BRA)$/i,
  Brunei: /^(Brunei|BRN)$/i,
  Bulgária: /^(Bulgaria|BGR)$/i,
  'Burkina Faso': /^(Burkina Faso|BFA)$/i,
  Burundi: /^(Burundi|BDI)$/i,
  'Cabo Verde': /^(Cabo Verde|CPV)$/i,
  Camboja: /^(Cambodia|KHM)$/i,
  Camarões: /^(Cameroon|CMR)$/i,
  Canadá: /^(Canada|CAN)$/i,
  Catar: /^(Qatar|QAT)$/i,
  Cazaquistão: /^(Kazakhstan|KAZ)$/i,
  Chade: /^(Chad|TCD)$/i,
  Chile: /^(Chile|CHL)$/i,
  China: /^(China|CHN)$/i,
  Chipre: /^(Cyprus|CYP)$/i,
  Colômbia: /^(Colombia|COL)$/i,
  Comores: /^(Comoros|COM)$/i,
  'Coreia do Norte': /^(North Korea|PRK)$/i,
  'Coreia do Sul': /^(South Korea|KOR)$/i,
  'Costa do Marfim': /^(Côte d'Ivoire|CIV)$/i,
  'Costa Rica': /^(Costa Rica|CRI)$/i,
  Croácia: /^(Croatia|HRV)$/i,
  Cuba: /^(Cuba|CUB)$/i,
  Dinamarca: /^(Denmark|DNK)$/i,
  Djibuti: /^(Djibouti|DJI)$/i,
  Dominica: /^(Dominica|DMA)$/i,
  Egito: /^(Egypt|EGY)$/i,
  'El Salvador': /^(El Salvador|SLV)$/i,
  'Emirados Árabes Unidos': /^(United Arab Emirates|ARE)$/i,
  Equador: /^(Ecuador|ECU)$/i,
  Eritreia: /^(Eritrea|ERI)$/i,
  Eslováquia: /^(Slovakia|SVK)$/i,
  Eslovênia: /^(Slovenia|SVN)$/i,
  Espanha: /^(Spain|ESP)$/i,
  EUA: /^(United States|USA|US)$/i,
  Estônia: /^(Estonia|EST)$/i,
  Eswatini: /^(Eswatini|SWZ)$/i,
  Etiópia: /^(Ethiopia|ETH)$/i,
  Fiji: /^(Fiji|FJI)$/i,
  Filipinas: /^(Philippines|PHL)$/i,
  Finlândia: /^(Finland|FIN)$/i,
  França: /^(France|FRA)$/i,
  Gabão: /^(Gabon|GAB)$/i,
  Gâmbia: /^(Gambia|GMB)$/i,
  Gana: /^(Ghana|GHA)$/i,
  Geórgia: /^(Georgia|GEO)$/i,
  Granada: /^(Grenada|GRD)$/i,
  Grécia: /^(Greece|GRC)$/i,
  Guatemala: /^(Guatemala|GTM)$/i,
  Guiana: /^(Guyana|GUY)$/i,
  Guiné: /^(Guinea|GIN)$/i,
  'Guiné-Bissau': /^(Guinea-Bissau|GNB)$/i,
  'Guiné Equatorial': /^(Equatorial Guinea|GNQ)$/i,
  Haiti: /^(Haiti|HTI)$/i,
  Holanda: /^(Netherlands|NLD)$/i,
  Honduras: /^(Honduras|HND)$/i,
  Hungria: /^(Hungary|HUN)$/i,
  Iémen: /^(Yemen|YEM)$/i,
  'Ilhas Marshall': /^(Marshall Islands|MHL)$/i,
  'Ilhas Salomão': /^(Solomon Islands|SLB)$/i,
  Índia: /^(India|IND)$/i,
  Indonésia: /^(Indonesia|IDN)$/i,
  Irã: /^(Iran|IRN)$/i,
  Iraque: /^(Iraq|IRQ)$/i,
  Irlanda: /^(Ireland|IRL)$/i,
  Islândia: /^(Iceland|ISL)$/i,
  Israel: /^(Israel|ISR)$/i,
  Itália: /^(Italy|ITA)$/i,
  Jamaica: /^(Jamaica|JAM)$/i,
  Japão: /^(Japan|JPN)$/i,
  Jordânia: /^(Jordan|JOR)$/i,
  Kiribati: /^(Kiribati|KIR)$/i,
  Kuwait: /^(Kuwait|KWT)$/i,
  Laos: /^(Laos|LAO)$/i,
  Lesoto: /^(Lesotho|LSO)$/i,
  Letônia: /^(Latvia|LVA)$/i,
  Líbano: /^(Lebanon|LBN)$/i,
  Libéria: /^(Liberia|LBR)$/i,
  Líbia: /^(Libya|LBY)$/i,
  Liechtenstein: /^(Liechtenstein|LIE)$/i,
  Lituânia: /^(Lithuania|LTU)$/i,
  Luxemburgo: /^(Luxembourg|LUX)$/i,
  Madagascar: /^(Madagascar|MDG)$/i,
  Malásia: /^(Malaysia|MYS)$/i,
  Malawi: /^(Malawi|MWI)$/i,
  Maldivas: /^(Maldives|MDV)$/i,
  Mali: /^(Mali|MLI)$/i,
  Malta: /^(Malta|MLT)$/i,
  Marrocos: /^(Morocco|MAR)$/i,
  Mauritânia: /^(Mauritania|MRT)$/i,
  Maurício: /^(Mauritius|MUS)$/i,
  México: /^(Mexico|MEX)$/i,
  Mianmar: /^(Myanmar|MMR)$/i,
  Micronésia: /^(Micronesia|FSM)$/i,
  Moçambique: /^(Mozambique|MOZ)$/i,
  Moldávia: /^(Moldova|MDA)$/i,
  Mônaco: /^(Monaco|MCO)$/i,
  Mongólia: /^(Mongolia|MNG)$/i,
  Montenegro: /^(Montenegro|MNE)$/i,
  Namíbia: /^(Namibia|NAM)$/i,
  Nauru: /^(Nauru|NRU)$/i,
  Nepal: /^(Nepal|NPL)$/i,
  Nicarágua: /^(Nicaragua|NIC)$/i,
  Níger: /^(Niger|NER)$/i,
  Nigéria: /^(Nigeria|NGA)$/i,
  Noruega: /^(Norway|NOR)$/i,
  'Nova Zelândia': /^(New Zealand|NZL)$/i,
  Omã: /^(Oman|OMN)$/i,
  Palau: /^(Palau|PLW)$/i,
  Panamá: /^(Panama|PAN)$/i,
  'Papua Nova Guiné': /^(Papua New Guinea|PNG)$/i,
  Paquistão: /^(Pakistan|PAK)$/i,
  Paraguai: /^(Paraguay|PRY)$/i,
  Peru: /^(Peru|PER)$/i,
  Polônia: /^(Poland|POL)$/i,
  Portugal: /^(Portugal|PRT)$/i,
  Quênia: /^(Kenya|KEN)$/i,
  Quirguistão: /^(Kyrgyzstan|KGZ)$/i,
  'Reino Unido': /^(United Kingdom|GBR|UK)$/i,
  'República Centro-Africana': /^(Central African Republic|CAF)$/i,
  'República Checa': /^(Czech Republic|CZE)$/i,
  'República Democrática do Congo': /^(Democratic Republic of the Congo|COD)$/i,
  'República do Congo': /^(Republic of the Congo|COG)$/i,
  'República Dominicana': /^(Dominican Republic|DOM)$/i,
  Romênia: /^(Romania|ROU)$/i,
  Ruanda: /^(Rwanda|RWA)$/i,
  Rússia: /^(Russia|RUS)$/i,
  Samoa: /^(Samoa|WSM)$/i,
  'San Marino': /^(San Marino|SMR)$/i,
  'Santa Lúcia': /^(Saint Lucia|LCA)$/i,
  'São Cristóvão e Nevis': /^(Saint Kitts and Nevis|KNA)$/i,
  'São Tomé e Príncipe': /^(Sao Tome and Principe|STP)$/i,
  'São Vicente e Granadinas': /^(Saint Vincent and the Grenadines|VCT)$/i,
  Senegal: /^(Senegal|SEN)$/i,
  'Serra Leoa': /^(Sierra Leone|SLE)$/i,
  Sérvia: /^(Serbia|SRB)$/i,
  Singapura: /^(Singapore|SGP)$/i,
  Síria: /^(Syria|SYR)$/i,
  Somália: /^(Somalia|SOM)$/i,
  'Sri Lanka': /^(Sri Lanka|LKA)$/i,
  Sudão: /^(Sudan|SDN)$/i,
  'Sudão do Sul': /^(South Sudan|SSD)$/i,
  Suécia: /^(Sweden|SWE)$/i,
  Suíça: /^(Switzerland|CHE)$/i,
  Suriname: /^(Suriname|SUR)$/i,
  Tailândia: /^(Thailand|THA)$/i,
  Tajiquistão: /^(Tajikistan|TJK)$/i,
  Tanzânia: /^(Tanzania|TZA)$/i,
  'Timor-Leste': /^(Timor-Leste|TLS)$/i,
  Togo: /^(Togo|TGO)$/i,
  Tonga: /^(Tonga|TON)$/i,
  'Trinidad e Tobago': /^(Trinidad and Tobago|TTO)$/i,
  Tunísia: /^(Tunisia|TUN)$/i,
  Turcomenistão: /^(Turkmenistan|TKM)$/i,
  Turquia: /^(Turkey|TUR)$/i,
  Tuvalu: /^(Tuvalu|TUV)$/i,
  Ucrânia: /^(Ukraine|UKR)$/i,
  Uganda: /^(Uganda|UGA)$/i,
  Uruguai: /^(Uruguay|URY)$/i,
  Uzbequistão: /^(Uzbekistan|UZB)$/i,
  Vanuatu: /^(Vanuatu|VUT)$/i,
  Vaticano: /^(Vatican City|VAT)$/i,
  Venezuela: /^(Venezuela|VEN)$/i,
  Vietnã: /^(Vietnam|VNM)$/i,
  Zâmbia: /^(Zambia|ZMB)$/i,
  Zimbábue: /^(Zimbabwe|ZWE)$/i,
};

export const translateCountry = (country: string): string => {
  for (const [translatedName, regex] of Object.entries(countryPatterns)) {
    if (regex.test(country)) {
      return translatedName;
    }
  }
  return country;
};
