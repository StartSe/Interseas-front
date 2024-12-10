import { ChatMessage } from '@/types';
import { constants } from '@/constants';

interface FileUploadsItem {
  mime: string;
  name: string;
  type: string;
}
export interface ChatHistoryItem {
  // Defina as propriedades específicas que estão dentro de cada objeto do chatHistory, ex.:
  message: string;
  timestamp: string;
  fileUploads: FileUploadsItem[];
  type: 'userMessage' | 'apiMessage';
  // Adicione mais campos conforme necessário
}

interface ChatHistoryResponse {
  chat_history: {
    chatHistory: ChatHistoryItem[];
  };
  agent_flow: string;
  chat_name: string | null;
  created_at: string;
  id: string;
  updated_at: string;
}

export class historyChatFlowiseAPI {
  async getFlowiseChatHistory(apiHost: string, chatFlowId: string, chatHistoryId: string) {
    const response = await fetch(`${apiHost}/api/v1/chatmessage/${chatFlowId}?chatId=${chatHistoryId}`, {
      method: 'GET',
      headers: {
        Authorization: `${constants.flowiseJwtToken}`,
      },
    });
    const chatData: ChatMessage[] = await response.json();
    return chatData;
  }
  async getChatHistory(chatId: string): Promise<any> {
    const response = await fetch(`${constants.n8nDomain}/webhook/${constants.n8nFlowGetChatHistoryFromSupabase}?chatId=${chatId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data: ChatHistoryResponse[] = await response.json();
    const formattedData = data[0].chat_history ? data[0].chat_history.chatHistory : [];
    return formattedData;
  }
}
export default historyChatFlowiseAPI;
