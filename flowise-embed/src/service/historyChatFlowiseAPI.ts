import { constants } from '@/constants';

interface Document {
  id: string;
  type: string;
  name: string;
  contents: any;
}

interface UsedTool {
  id: string;
  name: string;
  type: string;
  version: string;
}

interface FileAnnotation {
  id: string;
  type: string;
  name: string;
  contents: any;
}

interface AgentReasoning {
  id: string;
  type: string;
  content: string;
}

interface FileUpload {
  id: string;
  type: string;
  name: string;
  mime: string;
  contents: any;
}

interface Action {
  id: string;
  type: string;
  contents: any;
}

export interface ChatMessage {
  id: string;
  role: 'apiMessage' | 'userMessage' | 'selectionMessage';
  chatflowId: string;
  content: string;
  sourceDocuments: Document[] | null;
  usedTools: UsedTool[] | null;
  fileAnnotations: FileAnnotation[] | null;
  agentReasoning: AgentReasoning[] | null;
  fileUploads: FileUpload[] | null;
  action: Action[] | null;
  chatType: 'INTERNAL' | 'EXTERNAL';
  chatId: string;
  memoryType: string | null;
  sessionId: string | null;
  createdDate: string;
  leadEmail: string | null;
  disabled?: boolean;
}

export enum ChatRole {
  apiMessage = 'apiMessage',
  userMessage = 'userMessage',
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

  async setFlowiseChatHistory(apiHost: string, chatFlowId: string, chatHistoryId: string, data: string, role: string) {
    try {
      if (chatFlowId && apiHost && chatHistoryId) {
        const body = {
          chatflowid: chatFlowId,
          chatId: chatHistoryId,
          role: role,
          content: data,
        };

        const response = await fetch(`${apiHost}/api/v1/chatmessage/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${constants.flowiseJwtToken}`,
          },
          body: JSON.stringify(body),
        });

        await response.json();
      }
    } catch (error) {
      console.error('Error setting chat history:', error);
      throw error;
    }
  }
}

export default historyChatFlowiseAPI;
