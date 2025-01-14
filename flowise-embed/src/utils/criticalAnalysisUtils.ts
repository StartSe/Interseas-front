import { constants } from '@/constants';

export enum CriticalAnalysisPrefixes {
  criticalAnalysisFirstStep = 'ANALISE_1##',
  criticalAnalysisSecondStep = 'ANALISE_2##',
  criticalAnalysisThirdStep = 'ANALISE_3##',
  criticalAnalysisFourthStep = 'ANALISE_4##',
  criticalAnalysisFifthStep = 'ANALISE_5##',
  criticalAnalysisSixthStep = 'ANALISE_6##',
  criticalAnalysisSeventhStep = 'ANALISE_7##',
}

export const verifyNcmExistence = async (ncm: string) => {
  try {
    const result = await fetch(constants.n8nDomain + '/webhook/' + constants.n8nNcmValidatorURL, {
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
