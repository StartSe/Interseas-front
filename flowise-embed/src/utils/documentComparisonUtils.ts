export function comparePairDocuments(documentsForPairwiseComparison: string[]): void {
  const processedPairs: Set<string> = new Set();

  documentsForPairwiseComparison.forEach((firstDocumentNameForComparison, index) => {
    for (let nextIndex = index + 1; nextIndex < documentsForPairwiseComparison.length; nextIndex++) {
      const secondDocumentNameForComparison = documentsForPairwiseComparison[nextIndex];
      const pairKey = generatePairKey(firstDocumentNameForComparison, secondDocumentNameForComparison);

      if (processedPairs.has(pairKey)) {
        continue;
      }

      compareTwoDocuments(firstDocumentNameForComparison, secondDocumentNameForComparison);
      processedPairs.add(pairKey);
    }
  });
}

function generatePairKey(firstDocumentNameForComparison: string, secondDocumentNameForComparison: string): string {
  return [firstDocumentNameForComparison, secondDocumentNameForComparison].sort().join('-');
}

function compareTwoDocuments(firstDocumentNameForComparison: string, secondDocumentNameForComparison: string): void {
  console.log(`Comparing ${firstDocumentNameForComparison} with ${secondDocumentNameForComparison}`);
}
