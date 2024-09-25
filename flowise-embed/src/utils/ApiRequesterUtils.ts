import { MessageType } from '@/components/Bot';
class ApiRequester {
  urls = [
    'https://n8n.startse.com/webhook/a96d9f14-3835-4e08-b8a7-a77f3b754886',
    'https://n8n.startse.com/webhook/0164614d-e044-4c3f-9ef9-9212407bf402',
    // Adicione suas outras URLs aqui
  ];

  async makeRequests(jsonCriticalAnalysisUpdate: any, setMessages: (message: MessageType) => void) {
    const requests = this.urls.map(async (url) => {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(jsonCriticalAnalysisUpdate.text),
        });

        if (!response.ok) {
          throw new Error('response was not ok');
        }

        const data = await response.json();
        const message = { message: data.output, type: 'apiMessage' } as MessageType;

        setMessages(message);
      } catch (error) {
        console.error('Error:', error);
      }
    });

    await Promise.allSettled(requests);
  }
}

export default ApiRequester;
