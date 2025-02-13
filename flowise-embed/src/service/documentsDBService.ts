import { constants } from '@/constants';
import { Flow } from '@/features/bubble/types';
import { pdfToHash } from '@/utils/pdfUtils';
import { v4 as uuidv4 } from 'uuid';
import { extractNewFileProperties } from '@/utils/pdfUtils';
import { isDevEnv } from '@/utils/environmentUtils';
import { getAuthToken } from '@/utils/auth';

interface DocumentData {
  id: string;
  file_name?: string;
  mime_type?: string;
  hash: string;
  extraction_result?: any;
  checklist_result?: any;
  pdf_to_text?: string;
  version?: any;
  checklist_type?: string;
  agent_flow: string;
}

class DocumentsDBService {
  private getN8nWebhookUrl(flowId: string): string {
    const envParam = isDevEnv() ? 'Dev' : '';
    return `${constants.n8nDomain}/webhook/${flowId}${envParam}`;
  }

  private async sendDataToN8n(tableName: string, data: any): Promise<void> {
    if (!constants.useDatabase && isDevEnv()) return;

    try {
      await fetch(this.getN8nWebhookUrl(constants.n8nFlowSendDataToSupabase), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ tableName, data }),
      });
    } catch (error) {
      console.error('Error saving to the database:', error);
    }
  }

  private async getDocumentFromDBByHash(hash: any, agent_flow: Flow): Promise<any> {
    if (!constants.useDocumentCache && isDevEnv()) return null;

    try {
      const response = await fetch(this.getN8nWebhookUrl(constants.n8nFlowGetDataFromSupabase), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ hash, agent_flow }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Error find document on DB:', ${error}`);
    }
  }

  private async fetchChatDocumentRelation(chatId: any, documentId: any): Promise<any> {
    try {
      const response = await fetch(this.getN8nWebhookUrl(constants.n8nFlowFetchChatDocumentRelation), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ chatId, documentId }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Error finding document on DB:', ${error}`);
    }
  }

  private async fetchDocumentsByChatId(chatId: any): Promise<any> {
    if (!constants.useDocumentCache && isDevEnv()) return [];

    try {
      const response = await fetch(this.getN8nWebhookUrl(constants.n8nFlowFetchDocumentsByChatId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ chatId }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Error finding chatId on DB:', ${error}`);
    }
  }

  private async fetchChatIdsForFlow(flow: string): Promise<any> {
    try {
      const response = await fetch(this.getN8nWebhookUrl(constants.n8nFlowFetchChatIdsForFlow), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ flow }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Error finding chatId on DB:', ${error}`);
    }
  }

  private async sendDeleteChatRequest(chatId: string): Promise<void> {
    try {
      await fetch(this.getN8nWebhookUrl(constants.n8nFlowSendDeleteChatRequest), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ chatId }),
      });
    } catch (error) {
      throw new Error(`Error deleting chatId:', ${error}`);
    }
  }

  private async sendUpdateChatRenameRequest(chatId: string, chatName: string): Promise<any> {
    try {
      const response = await fetch(this.getN8nWebhookUrl(constants.n8nFlowSendUpdateChatRequest), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ chatId, chatName }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Error updating ChatName:', ${error}`);
    }
  }

  private async sendDataToDBThroughN8n(tableName: string, data: any): Promise<void> {
    try {
      await this.sendDataToN8n(tableName, data);
    } catch (error) {
      console.error('Error saving to the database:', error);
    }
  }

  private async isHashInDatabase(hash: string, agentFlow: Flow): Promise<boolean> {
    return await this.getDocumentFromDBByHash(hash, agentFlow);
  }

  private async isChatIdInDatabase(chatId: any): Promise<boolean> {
    return await this.fetchDocumentsByChatId(chatId);
  }

  private async doesChatDocumentRelationExist(chatId: any, documentId: any): Promise<boolean> {
    return await this.fetchChatDocumentRelation(chatId, documentId);
  }

  private async retrieveChatIdsForFlow(flow: string): Promise<string> {
    return await this.fetchChatIdsForFlow(flow);
  }

  private async removeChat(chatId: string): Promise<void> {
    await this.sendDeleteChatRequest(chatId);
  }

  private async updateChatRename(chatId: string, chatName: string): Promise<string | null> {
    return await this.sendUpdateChatRenameRequest(chatId, chatName);
  }

  private async extractDocumentData(fileMap: any, textContent: any, agentFlow: Flow, agentResult?: any): Promise<DocumentData> {
    const hashPdf = await pdfToHash(fileMap.file.file);
    const documentId = uuidv4();
    const { fileName, version } = extractNewFileProperties(fileMap.file.file.name);
    return {
      id: documentId,
      file_name: fileName,
      mime_type: fileMap.file.file.type,
      hash: hashPdf,
      extraction_result: fileMap.content || agentResult,
      checklist_result: fileMap.filledChecklist || agentResult,
      pdf_to_text: textContent,
      version: version,
      checklist_type: fileMap.type,
      agent_flow: agentFlow,
    };
  }

  public async saveChatData(chatData: any): Promise<void> {
    const tableName = 'chats';
    await this.sendDataToDBThroughN8n(tableName, chatData);
  }

  public async saveDocumentData(fileMap: any, textContent: any, agentFlow: Flow, chatId: any, agentResult?: any): Promise<void> {
    if (!constants.useDocumentCache && isDevEnv()) return;

    const tableName = 'documents';
    const documentData = await this.extractDocumentData(fileMap, textContent, agentFlow, agentResult?.text);
    await this.sendDataToDBThroughN8n(tableName, documentData);
    await this.saveChatDocumentData(chatId, documentData.id);
  }

  public async getDocumentsByChatId(chatId: any): Promise<any> {
    if (!constants.useDocumentCache && isDevEnv()) return null;

    try {
      const result = await this.isChatIdInDatabase(chatId);
      return result;
    } catch (error) {
      console.error('Error checking chatId on database:', error);
      return null;
    }
  }

  public async saveChatDocumentData(chatId: any, documentId: string): Promise<void> {
    const tableName = 'chats_documents';
    const chatDocumentData = {
      chat_id: chatId,
      document_id: documentId,
    };
    await this.sendDataToDBThroughN8n(tableName, chatDocumentData);
  }

  public async checkDocumentHash(hashPdf: any, agentFlow: Flow, chatId: any): Promise<boolean> {
    try {
      const isHashInDB = await this.isHashInDatabase(hashPdf, agentFlow);
      if (!isHashInDB) {
        return false;
      }

      const document = await this.getDocumentFromDBByHash(hashPdf, agentFlow);
      if (!document || !document.id) {
        return false;
      }

      const relationExists = await this.doesChatDocumentRelationExist(chatId, document.id);
      if (relationExists) {
        return true;
      }

      await this.saveChatDocumentData(chatId, document.id);
      return true;
    } catch (error) {
      console.error('Error checking hash on database:', error);
      return false;
    }
  }

  public async getProcessedDocumentData(fileMap: any, agentFlow: Flow, chatId: any): Promise<string | null> {
    if (!constants.useDocumentCache && isDevEnv()) return null;

    const hashPdf = await pdfToHash(fileMap.file.file);
    const hasBeenProcessed = await this.checkDocumentHash(hashPdf, agentFlow, chatId);
    if (hasBeenProcessed) {
      const document = await this.getDocumentFromDBByHash(hashPdf, agentFlow);
      return document?.checklist_result;
    }
    return null;
  }

  public async getChatIdsByFlow(flow: string): Promise<string | null> {
    try {
      const chatIds = await this.retrieveChatIdsForFlow(flow);
      return chatIds;
    } catch (error) {
      console.error('Error finding chatIds by flow:', error);
      return null;
    }
  }

  public async deleteChat(chatId: string): Promise<void> {
    try {
      await this.removeChat(chatId);
    } catch (error) {
      console.error('Error deleting chatId:', error);
      throw error;
    }
  }

  public async updateChatName(chatId: string, chatName: string): Promise<string | null> {
    try {
      const result = await this.updateChatRename(chatId, chatName);
      return result;
    } catch (error) {
      console.error('Error updating chatName:', error);
      throw error;
    }
  }
}

export default DocumentsDBService;
