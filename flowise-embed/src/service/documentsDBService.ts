import { constants } from '@/constants';
import { Flow } from '@/features/bubble/types';

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

  public async isHashInDatabase(hash: string, agent_flow: Flow): Promise<boolean> {
    console.log('Checking hash in the database:', hash);
    console.log('Checking hash in the agent_flow:', agent_flow);
    return await this.checkHashInDatabase(hash, agent_flow);
  }
}

export default DocumentsDBService;
