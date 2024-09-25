import { FileMapping } from '@/utils/fileUtils';
export default class CompareDocuments {
    private dependencies;
    private processedPairs;
    private listDifferentKeys;
    private parsedJsonExtractResponse;
    private lastMessage;
    constructor(dependencies: {
        fileMappings: FileMapping[];
        sendBackgroundMessage: (value: string, url: any) => Promise<any>;
        setMessages: (value: any) => void;
    });
    execute(): Promise<any>;
    private separateFilesInPairs;
    private generatePairKey;
    private processDocuments;
    private checkFilesInPairs;
    private comparePairForSpecificCompliance;
    private analyseFilesWithAI;
    private unifyDifferentValues;
    private convertToNaturalLanguage;
    private sendMessageToChat;
}
//# sourceMappingURL=compareDocuments.d.ts.map