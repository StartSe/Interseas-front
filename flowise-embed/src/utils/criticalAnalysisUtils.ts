import { MessageType } from '@/components/Bot';
import { criticalAnalysisStepNameMapping, identifyConstant, ncmStepFailureMessage } from './messageUtils';
import { constants } from '@/constants';

export const n8nCriticalAnalysisUrlSteps = [
  constants.n8nDomain + '/webhook/' + constants.n8nFirstStep,
  constants.n8nDomain + '/webhook/' + constants.n8nSecondStep,
  constants.n8nDomain + '/webhook/' + constants.n8nThirdStep,
  constants.n8nDomain + '/webhook/' + constants.n8nFourthStep,
  constants.n8nDomain + '/webhook/' + constants.n8nFifthStep,
  constants.n8nDomain + '/webhook/' + constants.n8nSixthStep,
  constants.n8nDomain + '/webhook/' + constants.n8nSeventhStep,
];

export const getCriticalAnalysisStepResults = async (criticalAnalysisStepUrl: string, ncmArray: string[], jsonDataCriticalAnalysis: any) => {
  const stepName = criticalAnalysisStepNameMapping[identifyConstant(criticalAnalysisStepUrl)];
  let message = `**${stepName}**\n`;

  for (const ncm of ncmArray) {
    message += `\n**NCM: ${ncm}**\n`;
    const analysisResultByNcm = await criticalAnalysisRequest(criticalAnalysisStepUrl, ncm, jsonDataCriticalAnalysis);
    message += `\n${analysisResultByNcm}\n`;
  }

  return { message: message, type: 'apiMessage' } as MessageType;
};
export const criticalAnalysisRequest = async (url: string, ncm: string, payload: any): Promise<string> => {
  try {
    const jsonCriticalAnalysisSingleNcm = { ...payload, NCM: ncm };
    jsonCriticalAnalysisSingleNcm.text = JSON.stringify(jsonCriticalAnalysisSingleNcm);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonCriticalAnalysisSingleNcm.text),
    });

    if (!response.ok) {
      throw new Error('response was not ok');
    }

    const data = await response.json();
    return data.output;
  } catch (error) {
    console.error('Error:', error);
    return ncmStepFailureMessage(url, ncm);
  }
};
