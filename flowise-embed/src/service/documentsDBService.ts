import { constants } from '@/constants';

interface DocumentData {
  file_name: string;
  file_extension: string;
  hash: string;
  checklist_result?: any;
  extraction_result?: any;
  pdf_to_text?: string;
  checklist_type?: string;
  images?: string[];
}

export default class DocumentDatabaseService {
  private apiEndpoint: string;
  private storageEndpoint: string;
  public documentData: DocumentData & { version: number };

  constructor(documentData: DocumentData) {
    this.apiEndpoint = `${constants.supabaseApiEndpoint}rest/v1/Documents`;
    this.storageEndpoint = `${constants.supabaseApiEndpoint}storage/v1/object/Interseas/`;

    const versionMatch = documentData.file_name.match(/v(\d+)/i);
    const version = versionMatch ? parseInt(versionMatch[1]) : 0; // Remove o 10 e usa somente parseInt sem base 10
    const fileNameWithoutVersion = documentData.file_name.replace(/v\d+/i, '').trim();

    this.documentData = { ...documentData, file_name: fileNameWithoutVersion, version };
  }

  public async saveDocument(): Promise<void> {
    try {
      await this.sendToDatabase(this.documentData);
    } catch (error) {
      console.error('Erro ao salvar documento:', error);
    }
  }

  private async sendToDatabase(document: DocumentData & { version: number }): Promise<void> {
    try {
      const response = await fetch(this.apiEndpoint, {
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
}
