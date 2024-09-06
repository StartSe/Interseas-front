export function processDocumentComparisons(documents: string[]): void {
  const processedCombinations: Set<string> = new Set();

  documents.forEach((docA, i) => {
    for (let j = i + 1; j < documents.length; j++) {
      const docB = documents[j];
      const combinationKey = generateCombinationKey(docA, docB);

      if (!processedCombinations.has(combinationKey)) {
        compareDocuments(docA, docB);
        processedCombinations.add(combinationKey);
      }
    }
  });
}

function generateCombinationKey(docA: string, docB: string): string {
  return [docA, docB].sort().join('-');
}

function compareDocuments(docA: string, docB: string): void {
  console.log(`Comparing ${docA} with ${docB}`);
}
