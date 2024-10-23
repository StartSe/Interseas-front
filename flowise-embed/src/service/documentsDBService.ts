import { constants } from '@/constants';

interface DocumentData {
  file_name: string;
  file_extension: string;
  hash: string;
  checklist_result?: any;
  extraction_result?: any;
  pdf_to_text?: string;
  checklist_type?: string;
}

class DocumentsDBService {
  private async sendToDatabase(document: DocumentData): Promise<void> {
    try {
      const response = await fetch(constants.n8nDomain + '/webhook/' + constants.n8nFlowSendDataToSupabase, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: constants.supabaseApiKey,
          Authorization: `Bearer ${constants.supabaseApiKey}`,
        },
        body: JSON.stringify(document),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar documento ao banco de dados.');
      }
    } catch (error) {
      console.error('Erro ao salvar no banco de dados:', error);
    }
  }

  public async saveDocument(documentData: DocumentData): Promise<void> {
    await this.sendToDatabase(documentData);
  }
}

export default DocumentsDBService;
