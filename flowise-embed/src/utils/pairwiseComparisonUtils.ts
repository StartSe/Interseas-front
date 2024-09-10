import { FileMapping } from '@/utils/fileUtils';
import { DocumentTypes } from './fileClassificationUtils';
import { CCTCOMPLIANCE, CE_MERCANTE, CRT } from './complianceUtils';

export function pairwiseCompareDocuments(
  fileMappings: FileMapping[],
  comparePair: (firstFile: FileMapping, secondFile: FileMapping) => void,
  sendMessage: (value: string, url: any) => Promise<any>,
  setMessages: (value: any) => void,
  setLoading: (value: boolean) => void,
): void {
  const processedPairs: Set<string> = new Set();

  comparePair = async (firstFile: FileMapping, secondFile: FileMapping): Promise<void> => {
    const firstFileWithAddedKey = JSON.stringify({
      ...firstFile.filledChecklist,
      type: firstFile.type,
    });

    const secondFileWithAddedKey = JSON.stringify({
      ...secondFile.filledChecklist,
      type: secondFile.type,
    });

    setLoading(true);

    const checkCompliance = async (complianceType: string) => {
      const prompt = 'Specific compliance ' + firstFileWithAddedKey + secondFileWithAddedKey + complianceType;
      const messages = await sendMessage(prompt, []);
      const message = messages.text;
      setLoading(false);
      setMessages((prevMessages: any) => [...prevMessages, { message: message, type: 'apiMessage' }]);
    };

    if (
      (firstFile.type === DocumentTypes.CCT && secondFile.type === DocumentTypes.CONHECIMENTO_HAWB) ||
      (firstFile.type === DocumentTypes.CONHECIMENTO_HAWB && secondFile.type === DocumentTypes.CCT)
    ) {
      await checkCompliance(CCTCOMPLIANCE);
    } else if (
      (firstFile.type === DocumentTypes.CE_MERCANTE && secondFile.type === DocumentTypes.CONHECIMENTO_BL) ||
      (firstFile.type === DocumentTypes.CONHECIMENTO_BL && secondFile.type === DocumentTypes.CE_MERCANTE)
    ) {
      await checkCompliance(CE_MERCANTE);
    } else if (
      (firstFile.type === DocumentTypes.CONHECIMENTO_CRT && secondFile.type === DocumentTypes.COMMERCIAL_INVOICE) ||
      (firstFile.type === DocumentTypes.COMMERCIAL_INVOICE && secondFile.type === DocumentTypes.CONHECIMENTO_CRT)
    ) {
      await checkCompliance(CRT);
    } else {
      console.log('Normal compliance');
    }
  };

  try {
    fileMappings.forEach((firstFileMappingToCompare, index) => {
      for (let nextIndex = index + 1; nextIndex < fileMappings.length; nextIndex++) {
        setLoading(true);
        const secondFileMappingToCompare = fileMappings[nextIndex];
        const pairKey = generatePairKey(firstFileMappingToCompare, secondFileMappingToCompare);

        if (processedPairs.has(pairKey)) {
          continue;
        }
        comparePair(firstFileMappingToCompare, secondFileMappingToCompare);
        processedPairs.add(pairKey);
      }
    });
  } catch (e) {
    console.error(e);
  }
}

function generatePairKey(firstFileMappingToCompare: FileMapping, secondFileMappingToCompare: FileMapping): string {
  return [JSON.stringify(firstFileMappingToCompare), JSON.stringify(secondFileMappingToCompare)].sort().join('-');
}
