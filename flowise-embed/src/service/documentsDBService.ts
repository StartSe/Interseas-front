import { constants } from '@/constants';
import { Flow } from '@/features/bubble/types';
import { pdfToHash } from '@/utils/pdfUtils';

interface DocumentData {
  file_name?: string;
  file_extension?: string;
  hash: string;
  checklist_result?: any;
  extraction_result?: any;
  pdf_to_text?: string;
  checklist_type?: string;
  agent_flow: string;
}

class DocumentsDBService {
  private async sendDataToN8n(document: DocumentData): Promise<void> {
    try {
      const response = await fetch(constants.n8nDomain + '/webhook/' + constants.n8nFlowSendDataToSupabase, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(document),
      });
    } catch (error) {
      console.error('Error saving to the database:', error);
    }
  }

  private async checkHashInDatabase(hash: any, agent_flow: Flow): Promise<boolean> {
    try {
      const response = await fetch(constants.n8nDomain + '/webhook/' + constants.n8nFlowGetDataToSupabase, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hash, agent_flow }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking hash in the database:', error);
      return false;
    }
  }

  public async saveDocument(documentData: DocumentData): Promise<void> {
    await this.sendDataToN8n(documentData);
  }

  public async isHashInDatabase(hash: string, agentFlow: Flow): Promise<boolean> {
    return await this.checkHashInDatabase(hash, agentFlow);
  }

  public async extractDocumentData(fileMap: any, textContent: any, agentFlow: Flow, agentResult?: any): Promise<DocumentData> {
    const hashPdf = await pdfToHash(fileMap.file.file);
    console.log('agentFlow:', agentFlow);
    return {
      file_name: fileMap.file.file.name,
      file_extension: fileMap.file.file.type,
      hash: hashPdf,
      checklist_result: fileMap.filledChecklist || agentResult,
      extraction_result: fileMap.content || agentResult,
      pdf_to_text: textContent,
      checklist_type: fileMap.type,
      agent_flow: agentFlow,
    };
  }

  public async saveDocumentData(documentData: DocumentData): Promise<void> {
    try {
      await this.saveDocument(documentData);
    } catch (error) {
      console.error('Error saving to the database:', error);
    }
  }

  public async extractAndSaveDocumentData(fileMap: any, textContent: any, agentFlow: Flow, agentResult?: any): Promise<void> {
    const documentData = await this.extractDocumentData(fileMap, textContent, agentFlow, agentResult?.text);
    await this.saveDocumentData(documentData);
  }

  public async checkDocumentHash(pdfSHA256: any, agentFlow: Flow): Promise<any> {
    try {
      const result = await this.isHashInDatabase(pdfSHA256, agentFlow);
      return result;
    } catch (error) {
      console.error('Error checking hash on database:', error);
      return null;
    }
  }

  public async extractSHA256AndCheckDocumentHash(fileMap: any, agentFlow: Flow): Promise<any> {
    const hashPdf = await pdfToHash(fileMap.file.file);
    const fileProcessed = await this.checkDocumentHash(hashPdf, agentFlow);
    return fileProcessed?.checklist_result;
  }
}

export default DocumentsDBService;
