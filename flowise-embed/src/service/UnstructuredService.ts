import { constants } from '@/constants';

interface Metadata {
  filetype: string;
  languages: string[];
  page_number: number;
  filename: string;
  parent_id?: string;
}

interface UnstructuredElement {
  type: string;
  element_id: string;
  text: string;
  metadata: Metadata;
}

type UnstructuredResponse = UnstructuredElement[];

class UnstructuredService {
  private apiHost: string;
  private path: string;

  constructor() {
    this.apiHost = constants.n8nDomain;
    this.path = constants.n8nPdfPath;
  }
  
  public async pdfToText(file: Blob): Promise<string> {
    const form = new FormData();
    form.append('files', file);
    const response: UnstructuredResponse = await fetch(`${this.apiHost}/${this.path}`, {
      method: 'POST',
      body: form,
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Failed to convert pdf to text');
      }
      return response.json();
    });

    return response.map((element) => element.text).join(' ');
  }
}

export default UnstructuredService;
