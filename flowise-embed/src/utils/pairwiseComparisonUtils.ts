import { FileMapping } from '@/utils/fileUtils';
import { DocumentTypes } from './fileClassificationUtils';
import { CCTCOMPLIANCE, CE_MERCANTE, CRT } from './complianceUtils';

export async function pairwiseCompareDocuments(
  fileMappings: FileMapping[],
  sendBackgroundMessage: (value: string, url: any) => Promise<any>,
  setMessages: (value: any) => void,
  crossValidation: (firstFile: FileMapping, secondFile: FileMapping) => Promise<void>,
): Promise<void> {
  const separateFiles = async () => {
    const processedPairs: Set<string> = new Set();
    await Promise.all(
      fileMappings.map(async (firstFileMappingToCompare, index) => {
        for (let nextIndex = index + 1; nextIndex < fileMappings.length; nextIndex++) {
          const secondFileMappingToCompare = fileMappings[nextIndex];
          const pairKey = generatePairKey(firstFileMappingToCompare, secondFileMappingToCompare);

          if (processedPairs.has(pairKey)) {
            continue;
          }
          await comparePair(firstFileMappingToCompare, secondFileMappingToCompare);
          crossValidation(firstFileMappingToCompare, secondFileMappingToCompare);
          processedPairs.add(pairKey);
        }
      }),
    );
  };

  const generatePairKey = (firstFileMappingToCompare: FileMapping, secondFileMappingToCompare: FileMapping): string => {
    return [JSON.stringify(firstFileMappingToCompare), JSON.stringify(secondFileMappingToCompare)].sort().join('-');
  };

  const comparePair = async (firstFile: FileMapping, secondFile: FileMapping): Promise<void> => {
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
      await checkCompliance(CCTCOMPLIANCE, firstFileWithAddedKey, secondFileWithAddedKey);
    } else if (CE_MERCANTExBL_CONHECIMENTO) {
      await checkCompliance(CE_MERCANTE, firstFileWithAddedKey, secondFileWithAddedKey);
    } else if (CRTxCOMERCIAL_INVOICE) {
      await checkCompliance(CRT, firstFileWithAddedKey, secondFileWithAddedKey);
    }
  };

  const checkCompliance = async (complianceType: string, firstFileWithAddedKey: string, secondFileWithAddedKey: string) => {
    const prompt = 'Specific compliance ' + firstFileWithAddedKey + secondFileWithAddedKey + complianceType;
    const messages = await sendBackgroundMessage(prompt, []);
    const message = messages.text;
    setMessages((prevMessages: any) => [...prevMessages, { message: message, type: 'apiMessage' }]);
  };

  try {
    await separateFiles();
  } catch (error) {
    console.log('Erro no envio da mensagem');
  }
}
