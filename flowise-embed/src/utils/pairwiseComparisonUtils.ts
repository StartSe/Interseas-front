import { FileMapping } from '@/utils/fileUtils';

export function pairwiseCompareDocuments(fileMappings: FileMapping[]): void {
  const processedPairs: Set<string> = new Set();

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

function comparePair(firstFileMappingToCompare: FileMapping, secondFileMappingToCompare: FileMapping): void {
  console.log(`Comparing ${JSON.stringify(firstFileMappingToCompare)} with ${JSON.stringify(secondFileMappingToCompare)}`);
}
