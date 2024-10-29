import { constants } from '@/constants';
import { Flow } from '@/features/bubble/types';
import { pdfToHash } from '@/utils/pdfUtils';

interface DocumentData {
  file_name?: string;
  mime_type?: string;
  hash: string;
  checklist_result?: any;
  extraction_result?: any;
  pdf_to_text?: string;
  checklist_type?: string;
  agent_flow: string;
}

class DocumentsDBService {
  private async sendDataToN8n(tableName: string, data: DocumentData): Promise<void> {
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

  public async saveDataOnDBByN8n(tableName: string, data: DocumentData): Promise<void> {
    try {
      await this.sendDataToN8n(tableName, data);
    } catch (error) {
      console.error('Error saving to the database:', error);
    }
  }

  public async isHashInDatabase(hash: string, agentFlow: Flow): Promise<boolean> {
    return await this.getDocumentFromDBByHash(hash, agentFlow);
  }

  public async extractDocumentData(fileMap: any, textContent: any, agentFlow: Flow, agentResult?: any): Promise<DocumentData> {
    const hashPdf = await pdfToHash(fileMap.file.file);
    return {
      file_name: fileMap.file.file.name,
      mime_type: fileMap.file.file.type,
      hash: hashPdf,
      checklist_result: fileMap.filledChecklist || agentResult,
      extraction_result: fileMap.content || agentResult,
      pdf_to_text: textContent,
      checklist_type: fileMap.type,
      agent_flow: agentFlow,
    };
  }

  public async sendChatDataToDB(chatData: any): Promise<void> {
    const tableName = 'chats';
    await this.saveDataOnDBByN8n(tableName, chatData);
  }

  public async sendExtractedDataToDB(fileMap: any, textContent: any, agentFlow: Flow, agentResult?: any): Promise<void> {
    const tableName = 'documents';
    const documentData = await this.extractDocumentData(fileMap, textContent, agentFlow, agentResult?.text);
    await this.saveDataOnDBByN8n(tableName, documentData);
  }

  public async checkDocumentHash(hashPdf: any, agentFlow: Flow): Promise<any> {
    try {
      const result = await this.isHashInDatabase(hashPdf, agentFlow);
      return result;
    } catch (error) {
      console.error('Error checking hash on database:', error);
      return null;
    }
  }

  public async checkDocumentForAlreadyProcessedData(fileMap: any, agentFlow: Flow): Promise<any> {
    const hashPdf = await pdfToHash(fileMap.file.file);
    const fileProcessed = await this.checkDocumentHash(hashPdf, agentFlow);
    return fileProcessed?.checklist_result;
  }
}

export default DocumentsDBService;
