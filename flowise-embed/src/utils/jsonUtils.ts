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
const removeAccents = (str: string) =>
  str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export const normalizeStateNames = (input: string): string => {
  const statePatterns: { [key: string]: string } = {
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
    'RIO GRANDE DO SUL': 'RS',
    RONDONIA: 'RO',
    RORAIMA: 'RR',
    'SANTA CATARINA': 'SC',
    'SAO PAULO': 'SP',
    SERGIPE: 'SE',
    TOCANTINS: 'TO',
  };

  const normalizedInput = removeAccents(input);

  return statePatterns[normalizedInput] || input;
};

const countryPatterns: { [key: string]: RegExp } = {
  Afeganistão: /^(Afghanistan|AFG|Afeganistao)$/i,
  'África do Sul': /^(South Africa|ZAF|Africa do Sul)$/i,
  Albânia: /^(Albania|ALB|Albania)$/i,
  Alemanha: /^(Germany|GER|Alemanha)$/i,
  Andorra: /^(Andorra|AND|Andorra)$/i,
  Angola: /^(Angola|AGO|Angola)$/i,
  'Antígua e Barbuda': /^(Antigua and Barbuda|ATG|Antigua e Barbuda)$/i,
  'Arábia Saudita': /^(Saudi Arabia|SAU|Arabia Saudita)$/i,
  Argélia: /^(Algeria|DZA|Argelia)$/i,
  Argentina: /^(Argentina|ARG|Argentina)$/i,
  Armênia: /^(Armenia|ARM|Armenia)$/i,
  Austrália: /^(Australia|AUS|Australia)$/i,
  Áustria: /^(Austria|AUT|Austria)$/i,
  Azerbaijão: /^(Azerbaijan|AZE|Azerbaijao)$/i,
  Bahamas: /^(Bahamas|BHS|Bahamas)$/i,
  Bahrein: /^(Bahrain|BHR|Bahrein)$/i,
  Bangladesh: /^(Bangladesh|BGD|Bangladesh)$/i,
  Barbados: /^(Barbados|BRB|Barbados)$/i,
  Belarus: /^(Belarus|BLR|Belarus)$/i,
  Bélgica: /^(Belgium|BEL|Belgica)$/i,
  Belize: /^(Belize|BLZ|Belize)$/i,
  Benin: /^(Benin|BEN|Benin)$/i,
  Butão: /^(Bhutan|BTN|Butao)$/i,
  Bolívia: /^(Bolivia|BOL|Bolivia)$/i,
  'Bósnia e Herzegovina': /^(Bosnia and Herzegovina|BIH|Bosnia e Hercegovina)$/i,
  Botsuana: /^(Botswana|BWA|Botsuana)$/i,
  Brasil: /^(Brazil|BRA|Brasil)$/i,
  Brunei: /^(Brunei|BRN|Brunei)$/i,
  Bulgária: /^(Bulgaria|BGR|Bulgaria)$/i,
  'Burkina Faso': /^(Burkina Faso|BFA|Burkina Faso)$/i,
  Burundi: /^(Burundi|BDI|Burundi)$/i,
  'Cabo Verde': /^(Cabo Verde|CPV|Cabo Verde)$/i,
  Camboja: /^(Cambodia|KHM|Camboja)$/i,
  Camarões: /^(Cameroon|CMR|Cameruns)$/i,
  Canadá: /^(Canada|CAN|Canada)$/i,
  Catar: /^(Qatar|QAT|Catar)$/i,
  Cazaquistão: /^(Kazakhstan|KAZ|Cazaquistao)$/i,
  Chade: /^(Chad|TCD|Chade)$/i,
  Chile: /^(Chile|CHL|Chile)$/i,
  China: /^(China|CHN|China)$/i,
  Chipre: /^(Cyprus|CYP|Chipre)$/i,
  Colômbia: /^(Colombia|COL|Colombia)$/i,
  Comores: /^(Comoros|COM|Comores)$/i,
  'Coreia do Norte': /^(North Korea|PRK|Coreia do Norte)$/i,
  'Coreia do Sul': /^(South Korea|KOR|Coreia do Sul)$/i,
  'Costa do Marfim': /^(Côte d'Ivoire|CIV|Costa do Marfim)$/i,
  'Costa Rica': /^(Costa Rica|CRI|Costa Rica)$/i,
  Croácia: /^(Croatia|HRV|Croacia)$/i,
  Cuba: /^(Cuba|CUB|Cuba)$/i,
  Dinamarca: /^(Denmark|DNK|Dinamarca)$/i,
  Djibuti: /^(Djibouti|DJI|Djibuti)$/i,
  Dominica: /^(Dominica|DMA|Dominica)$/i,
  Egito: /^(Egypt|EGY|Egito)$/i,
  'El Salvador': /^(El Salvador|SLV|El Salvador)$/i,
  'Emirados Árabes Unidos': /^(United Arab Emirates|ARE|Emirados Arabes Unidos)$/i,
  Equador: /^(Ecuador|ECU|Equador)$/i,
  Eritreia: /^(Eritrea|ERI|Eritreia)$/i,
  Eslováquia: /^(Slovakia|SVK|Eslovaquia)$/i,
  Eslovênia: /^(Slovenia|SVN|Eslovenia)$/i,
  Espanha: /^(Spain|ESP|Espanha)$/i,
  EUA: /^(United States|USA|US|EUA)$/i,
  Estônia: /^(Estonia|EST|Estonia)$/i,
  Eswatini: /^(Eswatini|SWZ|Eswatini)$/i,
  Etiópia: /^(Ethiopia|ETH|Etiopia)$/i,
  Fiji: /^(Fiji|FJI|Fiji)$/i,
  Filipinas: /^(Philippines|PHL|Filipinas)$/i,
  Finlândia: /^(Finland|FIN|Finlandia)$/i,
  França: /^(France|FRA|Franca)$/i,
  Gabão: /^(Gabon|GAB|Gabao)$/i,
  Gâmbia: /^(Gambia|GMB|Gambia)$/i,
  Gana: /^(Ghana|GHA|Gana)$/i,
  Geórgia: /^(Georgia|GEO|Georgia)$/i,
  Granada: /^(Grenada|GRD|Granada)$/i,
  Grécia: /^(Greece|GRC|Grecia)$/i,
  Guatemala: /^(Guatemala|GTM|Guatemala)$/i,
  Guiana: /^(Guyana|GUY|Guiana)$/i,
  Guiné: /^(Guinea|GIN|Guine)$/i,
  'Guiné-Bissau': /^(Guinea-Bissau|GNB|Guine-Bissau)$/i,
  'Guiné Equatorial': /^(Equatorial Guinea|GNQ|Guine Equatorial)$/i,
  Haiti: /^(Haiti|HTI|Haiti)$/i,
  Holanda: /^(Netherlands|NLD|Holanda)$/i,
  Honduras: /^(Honduras|HND|Honduras)$/i,
  Hungria: /^(Hungary|HUN|Hungria)$/i,
  Iémen: /^(Yemen|YEM|Iemen)$/i,
  'Ilhas Marshall': /^(Marshall Islands|MHL|Ilhas Marshall)$/i,
  'Ilhas Salomão': /^(Solomon Islands|SLB|Ilhas Salomao)$/i,
  Índia: /^(India|IND|India)$/i,
  Indonésia: /^(Indonesia|IDN|Indonesia)$/i,
  Irã: /^(Iran|IRN|Ira)$/i,
  Iraque: /^(Iraq|IRQ|Iraque)$/i,
  Irlanda: /^(Ireland|IRL|Irlanda)$/i,
  Islândia: /^(Iceland|ISL|Islândia)$/i,
  Israel: /^(Israel|ISR|Israel)$/i,
  Itália: /^(Italy|ITA|Italia)$/i,
  Jamaica: /^(Jamaica|JAM|Jamaica)$/i,
  Japão: /^(Japan|JPN|Japao)$/i,
  Jordânia: /^(Jordan|JOR|Jordania)$/i,
  Kiribati: /^(Kiribati|KIR|Kiribati)$/i,
  Kuwait: /^(Kuwait|KWT|Kuwait)$/i,
  Laos: /^(Laos|LAO|Laos)$/i,
  Lesoto: /^(Lesotho|LSO|Lesoto)$/i,
  Letônia: /^(Latvia|LVA|Letonia)$/i,
  Líbano: /^(Lebanon|LBN|Libano)$/i,
  Libéria: /^(Liberia|LBR|Liberia)$/i,
  Líbia: /^(Libya|LBY|Libia)$/i,
  Liechtenstein: /^(Liechtenstein|LIE|Liechtenstein)$/i,
  Lituânia: /^(Lithuania|LTU|Lituania)$/i,
  Luxemburgo: /^(Luxembourg|LUX|Luxemburgo)$/i,
  Madagascar: /^(Madagascar|MDG|Madagascar)$/i,
  Malásia: /^(Malaysia|MYS|Malaysia)$/i,
  Malawi: /^(Malawi|MWI|Malawi)$/i,
  Maldivas: /^(Maldives|MDV|Maldivas)$/i,
  Mali: /^(Mali|MLI|Mali)$/i,
  Malta: /^(Malta|MLT|Malta)$/i,
  Marrocos: /^(Morocco|MAR|Marrocos)$/i,
  Mauritânia: /^(Mauritania|MRT|Mauritania)$/i,
  Maurício: /^(Mauritius|MUS|Mauricio)$/i,
  México: /^(Mexico|MEX|Mexico)$/i,
  Mianmar: /^(Myanmar|MMR|Mianmar)$/i,
  Micronésia: /^(Micronesia|FSM|Micronesia)$/i,
  Moçambique: /^(Mozambique|MOZ|Mocambique)$/i,
  Moldávia: /^(Moldova|MDA|Moldavia)$/i,
  Mônaco: /^(Monaco|MCO|Monaco)$/i,
  Mongólia: /^(Mongolia|MNG|Mongolia)$/i,
  Montenegro: /^(Montenegro|MNE|Montenegro)$/i,
  Namíbia: /^(Namibia|NAM|Namibia)$/i,
  Nauru: /^(Nauru|NRU|Nauru)$/i,
  Nepal: /^(Nepal|NPL|Nepal)$/i,
  Nicarágua: /^(Nicaragua|NIC|Nicaragua)$/i,
  Níger: /^(Niger|NER|Niger)$/i,
  Nigéria: /^(Nigeria|NGA|Nigeria)$/i,
  Noruega: /^(Norway|NOR|Noruega)$/i,
  'Nova Zelândia': /^(New Zealand|NZL|Nova Zelandia)$/i,
  Omã: /^(Oman|OMN|Oma)$/i,
  Palau: /^(Palau|PLW|Palau)$/i,
  Panamá: /^(Panama|PAN|Panama)$/i,
  'Papua Nova Guiné': /^(Papua New Guinea|PNG|Papua Nova Guine)$/i,
  Paquistão: /^(Pakistan|PAK|Paquistao)$/i,
  Paraguai: /^(Paraguay|PRY|Paraguai)$/i,
  Peru: /^(Peru|PER|Peru)$/i,
  Polônia: /^(Poland|POL|Polonia)$/i,
  Portugal: /^(Portugal|PRT|Portugal)$/i,
  Quênia: /^(Kenya|KEN|Quenia)$/i,
  Quirguistão: /^(Kyrgyzstan|KGZ|Quirguistao)$/i,
  'Reino Unido': /^(United Kingdom|GBR|Reino Unido)$/i,
  'República Centro-Africana': /^(Central African Republic|CAF|Republica Centro-Africana)$/i,
  'República Checa': /^(Czech Republic|CZE|Republica Checa)$/i,
  'República Democrática do Congo': /^(Democratic Republic of the Congo|COD|Republica Democratica do Congo)$/i,
  'República do Congo': /^(Republic of the Congo|COG|Republica do Congo)$/i,
  'República Dominicana': /^(Republic of the Congo|COG|Republica Dominicana)$/i,
  Romênia: /^(Romania|ROU|Romenia)$/i,
  Ruanda: /^(Rwanda|RWA|Ruanda)$/i,
  Rússia: /^(Russia|RUS|Russia)$/i,
  Samoa: /^(Samoa|WSM|Samoa)$/i,
  'San Marino': /^(San Marino|SMR|Sao Marino)$/i,
  'Santa Lúcia': /^(Saint Lucia|LCA|Santa Lucia)$/i,
  'São Cristóvão e Nevis': /^(Saint Kitts and Nevis|KNA|Sao Cristovao e Nevis)$/i,
  'São Tomé e Príncipe': /^(Sao Tome and Principe|STP|Sao Tome e Principe)$/i,
  'São Vicente e Granadinas': /^(Saint Vincent and the Grenadines|VCT|Sao Vicente e Granadinas)$/i,
  Senegal: /^(Senegal|SEN|Senegal)$/i,
  'Serra Leoa': /^(Sierra Leone|SLE|Serra Leoa)$/i,
  Sérvia: /^(Serbia|SRB|Servia)$/i,
  Seychelles: /^(Seychelles|SYC|Seicheles)$/i,
  Singapura: /^(Singapore|SGP|Singapura)$/i,
  Síria: /^(Syria|SYR|Siria)$/i,
  Somália: /^(Somalia|SOM)$/i,
  'Sri Lanka': /^(Sri Lanka|LKA|Sri Lanka)$/i,
  Sudão: /^(Sudan|SDN|Sudao)$/i,
  'Sudão do Sul': /^(South Sudan|SSD|Sudao do Sul)$/i,
  Suécia: /^(Sweden|SWE|Suecia)$/i,
  Suíça: /^(Switzerland|CHE|Suica)$/i,
  Suriname: /^(Suriname|SUR|Suriname)$/i,
  Tailândia: /^(Thailand|THA|Tailandia)$/i,
  Tajiquistão: /^(Tajikistan|TJK|Tajiquistao)$/i,
  Tanzânia: /^(Tanzania|TZA|Tanzania)$/i,
  'Timor-Leste': /^(East-Timor|TLS|Timor-Leste)$/i,
  Togo: /^(Togo|TGO)$/i,
  Tonga: /^(Tonga|TON)$/i,
  'Trindade e Tobago': /^(Trinidad and Tobago|TTO|Trindade e Tobago)$/i,
  Tunísia: /^(Tunisia|TUN|Tunisia)$/i,
  Turcomenistão: /^(Turkmenistan|TKM|Turcomenistao)$/i,
  Turquia: /^(Turkey|TUR|Turquia)$/i,
  Tuvalu: /^(Tuvalu|TUV|Tuvalu)$/i,
  Ucrânia: /^(Ukraine|UKR|Ucrania)$/i,
  Uganda: /^(Uganda|UGA|Uganda)$/i,
  Uruguai: /^(Uruguay|URY|Uruguai)$/i,
  Uzbequistão: /^(Uzbekistan|UZB|Uzbequistao)$/i,
  Vanuatu: /^(Vanuatu|VUT|Vanuatu)$/i,
  Vaticano: /^(Vatican City|VAT|Vaticano)$/i,
  Venezuela: /^(Venezuela|VEN|Venezuela)$/i,
  Vietnã: /^(Vietnam|VNM|Vietna)$/i,
  Zâmbia: /^(Zambia|ZMB|Zambia)$/i,
  Zimbábue: /^(Zimbabwe|ZWE|Zimbabue)$/i,
};

export const normalizeCountryNames = (country: string): string => {
  for (const [translatedName, regex] of Object.entries(countryPatterns)) {
    if (regex.test(removeAccents(country))) {
      return translatedName;
    }
  }
  return country;
};
