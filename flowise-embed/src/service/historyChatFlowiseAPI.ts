import { ChatMessage } from '@/types';
import { constants } from '@/constants';

export class historyChatFlowiseAPI {
  async getChatHistory(apiHost: string, chatFlowId: string, chatHistoryId: string) {
    const response = await fetch(`${apiHost}/api/v1/chatmessage/${chatFlowId}?chatId=${chatHistoryId}`, {
      method: 'GET',
      headers: {
        Authorization: `${constants.flowiseJwtToken}`,
      },
    });
    const chatData: ChatMessage[] = await response.json();
    return chatData;
  }
}
export default historyChatFlowiseAPI;
