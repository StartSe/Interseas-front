import { MessageType } from '@/components/BotCriticalAnalysis';
import { constants } from '@/constants';
export default class ParallelApiExecutor {
  n8nUrls = [constants.n8nDomain + '/webhook/' + constants.n8nFirstStep, constants.n8nDomain + '/webhook/' + constants.n8nSecondStep];

  constructor(
    private dependencies: {
      jsonCriticalAnalysisUpdate: { text: string };
      setMessages: (value: any) => void;
    },
  ) {}

  public async execute(): Promise<void> {
    const requests = this.n8nUrls.map(async (url) => {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.dependencies.jsonCriticalAnalysisUpdate.text),
        });

        if (!response.ok) {
          throw new Error('response was not ok');
        }

        const data = await response.json();
        const message = { message: data.output, type: 'apiMessage' } as MessageType;

        this.sendMessageToChat(message);
      } catch (error) {
        console.error('Error:', error);
      }
    });

    await Promise.allSettled(requests);
  }

  private sendMessageToChat(message: any): void {
    this.dependencies.setMessages((prevMessages: any) => [...prevMessages, message]);
  }
}
