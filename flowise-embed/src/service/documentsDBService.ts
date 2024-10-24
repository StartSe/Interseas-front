import { constants } from '@/constants';

interface DocumentData {
  file_name: string;
  file_extension: string;
  hash: any;
  checklist_result?: any;
  extraction_result?: any;
  pdf_to_text?: string;
  checklist_type?: string;
}

class DocumentsDBService {
  private async sendToDatabase(document: DocumentData): Promise<void> {
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

  public async saveDocument(documentData: DocumentData): Promise<void> {
    await this.sendToDatabase(documentData);
  }
}

export default DocumentsDBService;
