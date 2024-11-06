import { constants } from '@/constants';
import { Flow } from '@/features/bubble/types';
import { pdfToHash } from '@/utils/pdfUtils';
import { v4 as uuidv4 } from 'uuid';
import { extractNewFileProperties } from '@/utils/pdfUtils';

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
  private async sendDataToN8n(tableName: string, data: any): Promise<void> {
    try {
      await fetch(constants.n8nDomain + '/webhook/' + constants.n8nFlowSendDataToSupabase, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tableName, data }),
      });
    } catch (error) {
      console.error('Error saving to the database:', error);
    }
  }

  private async getDocumentFromDBByHash(hash: any, agent_flow: Flow): Promise<any> {
    try {
      const response = await fetch(constants.n8nDomain + '/webhook/' + constants.n8nFlowGetDataFromSupabase, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      const response = await fetch(constants.n8nDomain + '/webhook/' + constants.n8nFlowFetchChatDocumentRelation, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatId, documentId }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Error find document on DB:', ${error}`);
    }
  }

  private async fetchDocumentsByChatId(chatId: any): Promise<any> {
    try {
      const response = await fetch(constants.n8nDomain + '/webhook/' + constants.n8nFlowFetchDocumentsByChatId, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatId }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Error find chatId on DB:', ${error}`);
    }
  }

  private async sendDataToDBThroughN8n(tableName: string, data: any): Promise<void> {
    try {
      await this.sendDataToN8n(tableName, data);
    } catch (error) {
      console.error('Error saving to the database:', error);
    }
  }

  private async isHashInDatabase(hash: string, agentFlow: Flow): Promise<any> {
    return await this.getDocumentFromDBByHash(hash, agentFlow);
  }

  private async isChatIdInDatabase(chatId: any): Promise<boolean> {
    return await this.fetchDocumentsByChatId(chatId);
  }

  private async isRelationChatsDocuments(chatId: any, documentId: any): Promise<boolean> {
    return await this.fetchChatDocumentRelation(chatId, documentId);
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
    const tableName = 'documents';
    const documentData = await this.extractDocumentData(fileMap, textContent, agentFlow, agentResult?.text);
    await this.sendDataToDBThroughN8n(tableName, documentData);
    await this.saveChatDocumentData(chatId, documentData.id);
  }

  public async getDocumentsByChatId(chatId: any): Promise<any> {
    try {
      const result = await this.isChatIdInDatabase(chatId);
      return result;
    } catch (error) {
      console.error('Error checking chatId on database:', error);
      return null;
    }
  }

  public async getRelationChatsDocuments(chatId: any, documentId: any): Promise<any> {
    try {
      const result = await this.isRelationChatsDocuments(chatId, documentId);
      return result;
    } catch (error) {
      console.error('Error checking relation on database chatsDocumets:', error);
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

  public async checkDocumentHash(hashPdf: any, agentFlow: Flow, chatId: any): Promise<any> {
    try {
      const result = await this.isHashInDatabase(hashPdf, agentFlow);
      if (!result || !result.id) {
        return result;
      }

      const relationExists = await this.isRelationChatsDocuments(chatId, result.id);
      if (relationExists) {
        return result;
      }

      await this.saveChatDocumentData(chatId, result.id);
      return result;
    } catch (error) {
      console.error('Error checking hash on database:', error);
      return null;
    }
  }

  public async checkDocumentForAlreadyProcessedData(fileMap: any, agentFlow: Flow, chatId: any): Promise<any> {
    const hashPdf = await pdfToHash(fileMap.file.file);
    const fileProcessed = await this.checkDocumentHash(hashPdf, agentFlow, chatId);
    return fileProcessed?.checklist_result;
  }
}

export default DocumentsDBService;
