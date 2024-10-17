import { constants } from '@/constants';

interface DocumentData {
  file_name: string;
  file_extension: string;
  hash: string;
  checklist_result?: any;
  extraction_result?: any;
  pdf_to_text?: string;
  images?: string[];
}

export default class DocumentDatabaseService {
  private apiEndpoint: string;
  private storageEndpoint: string;
  public documentData: DocumentData & { version: number };

  constructor(documentData: DocumentData) {
    this.apiEndpoint = `${constants.supabaseApiEndpoint}/Documents`;
    this.storageEndpoint = `${constants.supabaseStorageEndpoint}`;

    const versionMatch = documentData.file_name.match(/v(\d+)/);
    const version = versionMatch ? parseInt(versionMatch[1], 10) : 1;

    this.documentData = { ...documentData, version };
  }

  public async saveDocument(): Promise<void> {
    try {
      //   await this.saveImagesToBucket();
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

  //   // Método para salvar as imagens geradas no Supabase Storage Bucket
  //   private async saveImagesToBucket(): Promise<void> {
  //     if (!this.documentData.images || this.documentData.images.length === 0) {
  //       console.log('Nenhuma imagem para salvar.');
  //       return;
  //     }

  //     const savedImageUrls: string[] = [];
  //     for (let i = 0; i < this.documentData.images.length; i++) {
  //       const image = this.documentData.images[i];
  //       const fileName = `${this.documentData.file_name}-page-${i + 1}.png`;

  //       try {
  //         const response = await fetch(`${this.storageEndpoint}/upload`, {
  //           method: 'POST',
  //           headers: {
  //             apikey: constants.supabaseApiKey,
  //             Authorization: `Bearer ${constants.supabaseApiKey}`,
  //             'Content-Type': 'application/octet-stream', // para enviar a imagem em binário
  //           },
  //           body: image, // Aqui, você pode enviar o Blob ou base64 da imagem
  //         });

  //         if (response.ok) {
  //           const { Key } = await response.json();
  //           const imageUrl = `${this.storageEndpoint}/public/${Key}`;
  //           savedImageUrls.push(imageUrl);
  //         } else {
  //           throw new Error('Erro ao salvar imagem no bucket.');
  //         }
  //       } catch (error) {
  //         console.error('Erro ao salvar imagem no bucket:', error);
  //       }
  //     }

  //     // Atualiza o documento com as URLs das imagens salvas
  //     this.documentData.images = savedImageUrls;
  //   }
}
