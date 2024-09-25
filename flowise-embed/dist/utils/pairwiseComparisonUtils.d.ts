import { FileMapping } from '@/utils/fileUtils';
export default class CompareDocuments {
    private dependencies;
    private processedPairs;
    private listDifferentKeys;
    private parsedJsonExtractResponse;
    constructor(dependencies: {
        fileMappings: FileMapping[];
        sendBackgroundMessage: (value: string, url: any) => Promise<any>;
        setMessages: (value: any) => void;
    });
    execute(): Promise<void>;
    private separateFilesInPairs;
    private generatePairKey;
    private processDocuments;
    private checkFilesInPairs;
    private comparePairForSpecificCompliance;
    private analyseFilesWithAI;
    private verifyValues;
    private convertToNaturalLanguage;
    private sendMessageToChat;
}
//# sourceMappingURL=pairwiseComparisonUtils.d.ts.map