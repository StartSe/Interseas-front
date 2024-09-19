import { FileMapping } from '@/utils/fileUtils';
import { DocumentTypes } from './fileClassificationUtils';
import { CCTCOMPLIANCE, CE_MERCANTE, CRT } from './complianceUtils';

export default class CompareDocuments {
  private processedPairs: { key: string; firstDocument: FileMapping; secondDocument: FileMapping }[] = [];

  private listDifferentKeys: any[] = [];

  private parsedJsonExtractResponse: any;

  constructor(
    private dependencies: {
      fileMappings: FileMapping[];
      sendBackgroundMessage: (value: string, url: any) => Promise<any>;
      setMessages: (value: any) => void;
    },
  ) {}

  public async execute(): Promise<void> {
    try {
      this.separateFilesInPairs();

      await this.processDocuments();
    } catch (err) {
      console.log(err);
    }
  }

  private separateFilesInPairs(): void {
    try {
      this.dependencies.fileMappings.forEach((firstFileMappingToCompare, index) => {
        for (let nextIndex = index + 1; nextIndex < this.dependencies.fileMappings.length; nextIndex++) {
          const secondFileMappingToCompare = this.dependencies.fileMappings[nextIndex];
          const pairKey = this.generatePairKey(firstFileMappingToCompare, secondFileMappingToCompare);

          const documentsToCompare = { key: pairKey, firstDocument: firstFileMappingToCompare, secondDocument: secondFileMappingToCompare };
          if (this.processedPairs.find((d) => d.key === documentsToCompare.key)) {
            continue;
          }

          this.processedPairs.push(documentsToCompare);
        }
      });
    } catch (err) {
      console.log(err);
    }
  }

  private generatePairKey(firstFileMappingToCompare: FileMapping, secondFileMappingToCompare: FileMapping): string {
    return [JSON.stringify(firstFileMappingToCompare), JSON.stringify(secondFileMappingToCompare)].sort().join('-');
  }

  private async processDocuments(): Promise<void> {
    await Promise.all(
      this.processedPairs.map(async ({ firstDocument, secondDocument }) => {
        try {
          await this.checkFilesInPairs(firstDocument, secondDocument);
        } catch (err) {
          console.log(err);
        }
      }),
    );
  }

  private async checkFilesInPairs(firstFile: FileMapping, secondFile: FileMapping) {
    const prompt = this.comparePairForSpecificCompliance(firstFile, secondFile);

    await this.analyseFilesWithAI(prompt);

    if (prompt.includes('Specific compliance')) {
      this.sendMessageToChat(this.parsedJsonExtractResponse);
      return;
    }

    this.unifyDifferentValues();

    await this.convertToNaturalLanguage();
  }

  private comparePairForSpecificCompliance(firstFile: FileMapping, secondFile: FileMapping): string {
    const CCTxHAWB =
      (firstFile.type === DocumentTypes.CCT && secondFile.type === DocumentTypes.CONHECIMENTO_HAWB) ||
      (firstFile.type === DocumentTypes.CONHECIMENTO_HAWB && secondFile.type === DocumentTypes.CCT);

    const CE_MERCANTExBL_CONHECIMENTO =
      (firstFile.type === DocumentTypes.CE_MERCANTE && secondFile.type === DocumentTypes.CONHECIMENTO_BL) ||
      (firstFile.type === DocumentTypes.CONHECIMENTO_BL && secondFile.type === DocumentTypes.CE_MERCANTE);

    const CRTxCOMERCIAL_INVOICE =
      (firstFile.type === DocumentTypes.CONHECIMENTO_CRT && secondFile.type === DocumentTypes.COMMERCIAL_INVOICE) ||
      (firstFile.type === DocumentTypes.COMMERCIAL_INVOICE && secondFile.type === DocumentTypes.CONHECIMENTO_CRT);

    const firstFileWithAddedKey = JSON.stringify({
      ...firstFile.filledChecklist,
      type: firstFile.type,
    });

    const secondFileWithAddedKey = JSON.stringify({
      ...secondFile.filledChecklist,
      type: secondFile.type,
    });

    if (CCTxHAWB) {
      return 'Specific compliance ' + firstFileWithAddedKey + secondFileWithAddedKey + CCTCOMPLIANCE;
    } else if (CE_MERCANTExBL_CONHECIMENTO) {
      return 'Specific compliance ' + firstFileWithAddedKey + secondFileWithAddedKey + CE_MERCANTE;
    } else if (CRTxCOMERCIAL_INVOICE) {
      return 'Specific compliance ' + firstFileWithAddedKey + secondFileWithAddedKey + CRT;
    } else {
      return `CROSS_VALIDATION\n${JSON.stringify(firstFile.type)} ${JSON.stringify(firstFile.content)}\n${JSON.stringify(
        secondFile.type,
      )} ${JSON.stringify(secondFile.content)}`;
    }
  }

  private async analyseFilesWithAI(prompt: string) {
    const response = await this.dependencies.sendBackgroundMessage(prompt, []);

    if (prompt.includes('Specific compliance')) {
      this.parsedJsonExtractResponse = response.text;
      return;
    }

    const extractedJsonResponse = response.text.replace(/```json|```/g, '');

    this.parsedJsonExtractResponse = JSON.parse(extractedJsonResponse);
  }

  private unifyDifferentValues() {
    try {
      this.parsedJsonExtractResponse.equivalent_keys.forEach((dataDocument: any) => {
        if (dataDocument.data[0].value !== dataDocument.data[1].value) {
          const differentValue = {
            [dataDocument.data[0].key_identifier]: [
              {
                document_name: dataDocument.data[0].document_name,
                key_name: dataDocument.data[0].key_name,
                value: dataDocument.data[0].value,
              },
              {
                document_name: dataDocument.data[1].document_name,
                key_name: dataDocument.data[1].key_name,
                value: dataDocument.data[1].value,
              },
            ],
          };

          this.listDifferentKeys.push(differentValue);
        }
      });
    } catch (err) {
      console.log(err);
    }
  }

  private async convertToNaturalLanguage() {
    if (this.listDifferentKeys.length > 0) {
      const listDifferentKeysPrompt = `LIST_DIFFERENT_KEYS\n${JSON.stringify(this.listDifferentKeys)}`;
      const listDifferentKeysResponse = await this.dependencies.sendBackgroundMessage(listDifferentKeysPrompt, []);
      const extractedDifferentKeysResponse = listDifferentKeysResponse.text.replace(/```json|```|\n|"|\\/g, '');

      this.sendMessageToChat(extractedDifferentKeysResponse);
    }
  }

  private sendMessageToChat(message: string): void {
    this.dependencies.setMessages((prevMessages: any) => [
      ...prevMessages,
      {
        message: JSON.stringify(message),
        type: 'apiMessage',
      },
    ]);
  }
}
