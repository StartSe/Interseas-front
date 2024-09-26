import { MessageType } from '@/components/BotCriticalAnalysis';
export default class ParallelApiExecutor {
  n8nUrls = ['https://n8n.startse.com/webhook/a96d9f14-3835-4e08-b8a7-a77f3b754886'];

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
