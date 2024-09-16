import { FileMapping } from '@/utils/fileUtils';
<<<<<<< HEAD
<<<<<<< HEAD
export declare function pairwiseCompareDocuments(fileMappings: FileMapping[], sendBackgroundMessage: (value: string, url: any) => Promise<any>, setMessages: (value: any) => void, crossValidation: (firstFile: FileMapping, secondFile: FileMapping) => Promise<void>): Promise<void>;
=======
export declare function pairwiseCompareDocuments(fileMappings: FileMapping[], comparePair: (firstFile: FileMapping, secondFile: FileMapping) => void, sendMessage: (value: string, url: any) => Promise<any>, setMessages: (value: any) => void, setLoading: (value: boolean) => void): void;
>>>>>>> 44ded34 (feat: call loading bubble and add commercial invoice compliance)
=======
export declare function pairwiseCompareDocuments(fileMappings: FileMapping[], sendBackgroundMessage: (value: string, url: any) => Promise<any>, setMessages: (value: any) => void): Promise<void>;
>>>>>>> 0ede8c9 (refactor: specific compliance check)
//# sourceMappingURL=pairwiseComparisonUtils.d.ts.map