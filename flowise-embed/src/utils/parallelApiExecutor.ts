import { MessageType } from '@/components/Bot';
import { constants } from '@/constants';
import { criticalAnalysisStepNameMapping, identifyConstant, ncmStepFailureMessage } from './messageUtils';
export default class ParallelApiExecutor {
  n8nUrls = [
    constants.n8nDomain + '/webhook/' + constants.n8nFirstStep,
    constants.n8nDomain + '/webhook/' + constants.n8nSecondStep,
    constants.n8nDomain + '/webhook/' + constants.n8nThirdStep,
    constants.n8nDomain + '/webhook/' + constants.n8nFourthStep,
    constants.n8nDomain + '/webhook/' + constants.n8nFifthStep,
    constants.n8nDomain + '/webhook/' + constants.n8nSixthStep,
    constants.n8nDomain + '/webhook/' + constants.n8nSeventhStep,
  ];

  constructor(
    private dependencies: {
      jsonCriticalAnalysisUpdate: { text: string };
      setMessages: (value: any) => void;
    },
  ) {}

  public async execute(): Promise<void> {
    const payload = JSON.parse(this.dependencies.jsonCriticalAnalysisUpdate.text);
    const ncmArray = payload['NCM'] as string[];

    const processNcm = async (url: string, ncm: string): Promise<string> => {
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

    for (const url of this.n8nUrls) {
      const stepName = criticalAnalysisStepNameMapping[identifyConstant(url)];
      let message = `**${stepName}**\n`;

      for (const ncm of ncmArray) {
        message += `\n**NCM: ${ncm}**\n`;
        const result = await processNcm(url, ncm);
        message += `\n${result}\n`;
      }

      const finalMessage = { message, type: 'apiMessage' } as MessageType;
      this.sendMessageToChat(finalMessage);
    }
  }

  private sendMessageToChat(message: any): void {
    this.dependencies.setMessages((prevMessages: any) => [...prevMessages, message]);
  }
}
