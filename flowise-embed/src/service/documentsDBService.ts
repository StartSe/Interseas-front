import { constants } from '@/constants';

interface DocumentData {
  file_name?: string;
  file_extension?: string;
  hash: string;
  checklist_result?: any;
  extraction_result?: any;
  pdf_to_text?: string;
  checklist_type?: string;
}

class DocumentsDBService {
  private async sendDataToN8n(document: DocumentData): Promise<void> {
    try {
      await fetch(constants.n8nDomain + '/webhook/' + constants.n8nFlowSendDataToSupabase, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: constants.supabaseApiKey,
          Authorization: `Bearer ${constants.supabaseApiKey}`,
        },
        body: JSON.stringify(document),
      });
    } catch (error) {
      console.error('Error saving to the database:', error);
    }
  }

  private async checkHashInDatabase(hash: any): Promise<boolean> {
    try {
      const response = await fetch(constants.n8nDomain + '/webhook/' + constants.n8nFlowGetDataToSupabase, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: constants.supabaseApiKey,
          Authorization: `Bearer ${constants.supabaseApiKey}`,
        },
        body: JSON.stringify({ hash }),
      });

      const data = await response.json();
      console.log('data', data);
      return data;
    } catch (error) {
      console.error('Error checking hash in the database:', error);
      return false;
    }
  }

  public async saveDocument(documentData: DocumentData): Promise<void> {
    await this.sendDataToN8n(documentData);
  }

  public async isHashInDatabase(hash: string): Promise<boolean> {
    return await this.checkHashInDatabase(hash);
  }
}

export default DocumentsDBService;
