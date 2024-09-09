import { FileMapping } from '@/utils/fileUtils';
import { DocumentTypes } from './fileClassificationUtils';

export function pairwiseCompareDocuments(fileMappings: FileMapping[], comparePair: (firstFile: FileMapping, secondFile: FileMapping) => void): void {
  const processedPairs: Set<string> = new Set();

  comparePair = (firstFile, secondFile) => {
    if (
      (firstFile.type === DocumentTypes.CCT && secondFile.type === DocumentTypes.CONHECIMENTO_HAWB) ||
      (firstFile.type === DocumentTypes.CONHECIMENTO_HAWB && secondFile.type === DocumentTypes.CCT)
    ) {
      console.log('Specific compliance');
    } else if (
      (firstFile.type === DocumentTypes.CE_MERCANTE && secondFile.type === DocumentTypes.CONHECIMENTO_BL) ||
      (firstFile.type === DocumentTypes.CONHECIMENTO_BL && secondFile.type === DocumentTypes.CE_MERCANTE)
    ) {
      console.log('Second compliance');
    } else {
      console.log('Files passed the validation');
    }
  };

  fileMappings.forEach((firstFileMappingToCompare, index) => {
    for (let nextIndex = index + 1; nextIndex < fileMappings.length; nextIndex++) {
      const secondFileMappingToCompare = fileMappings[nextIndex];
      const pairKey = generatePairKey(firstFileMappingToCompare, secondFileMappingToCompare);

      if (processedPairs.has(pairKey)) {
        continue;
      }

      comparePair(firstFileMappingToCompare, secondFileMappingToCompare);
      processedPairs.add(pairKey);
    }
  });
}

function generatePairKey(firstFileMappingToCompare: FileMapping, secondFileMappingToCompare: FileMapping): string {
  return [JSON.stringify(firstFileMappingToCompare), JSON.stringify(secondFileMappingToCompare)].sort().join('-');
}
