export enum CriticalAnalysisPrefixes {
  criticalAnalysisFirstStep = 'ANALISE_1##',
  criticalAnalysisSecondStep = 'ANALISE_2##',
  criticalAnalysisThirdStep = 'ANALISE_3##',
  criticalAnalysisFourthStep = 'ANALISE_4##',
  criticalAnalysisFifthStep = 'ANALISE_5##',
  criticalAnalysisSixthStep = 'ANALISE_6##',
  criticalAnalysisSeventhStep = 'ANALISE_7##',
}

export const ncmValidatorURL = 'https://interseas-n8n.paas.startse.com/webhook/ncmValidator';

export function removeNcmFromArray(arr: string[], str: string): string[] {
  return arr.filter((item) => item !== str);
}

export const handleNcmExistence = async (ncm: string) => {
  try {
    const result = await fetch(ncmValidatorURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ NCM: ncm }),
    });
    return result.json();
  } catch (error) {
    console.error(error);
    return {};
  }
};
