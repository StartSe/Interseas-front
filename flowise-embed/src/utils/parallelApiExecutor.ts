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
      setLoading: (value: boolean) => void;
    },
  ) {}

  public async execute(): Promise<void> {
    const payload = JSON.parse(this.dependencies.jsonCriticalAnalysisUpdate.text);
    const ncms = payload['NCM'];
    const requests = this.n8nUrls.map(async (url) => {
      ncms.forEach(async (ncm: any) => {
        try {
          const newPayload = { ...payload, NCM: ncm };
          newPayload.text = JSON.stringify(newPayload);
          console.log(newPayload);
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newPayload.text),
          });

          if (!response.ok) {
            throw new Error('response was not ok');
          }

          const data = await response.json();
          const message = { message: data.output, type: 'apiMessage' } as MessageType;

          this.sendMessageToChat(message);
        } catch (error) {
          console.error('Error:', error);
          const errorMessage = { message: ncmStepFailureMessage(url, ncm), type: 'apiMessage' } as MessageType;
          this.sendMessageToChat(errorMessage);
        }
      });
    });

    await Promise.allSettled(requests);
  }

  private sendMessageToChat(message: any): void {
    this.dependencies.setMessages((prevMessages: any) => [...prevMessages, message]);
  }

  private async makeStepRequest(url: string, payload: any, ncms: any[]): Promise<any> {
    const message = criticalAnalysisStepNameMapping[identifyConstant(url)].concat('\n');
    for (const ncm of ncms) {
      try {
        const newPayload = { ...payload, NCM: ncm };
        newPayload.text = JSON.stringify(newPayload);
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload.text),
        });

        if (!response.ok) {
          throw new Error('response was not ok');
        }

        const data = await response.json();
        message.concat(data.output, '\n');

        this.sendMessageToChat(message);
      } catch (error) {
        console.error('Error:', error);
        const errorMessage = { message: ncmStepFailureMessage(url, ncm), type: 'apiMessage' } as MessageType;
        this.sendMessageToChat(errorMessage);
      }
    }
    const finalMessage = { message: message, type: 'apiMessage' } as MessageType;
    this.sendMessageToChat(finalMessage);
  }
}
