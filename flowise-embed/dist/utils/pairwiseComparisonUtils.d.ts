import { FileMapping } from '@/utils/fileUtils';
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
export declare function pairwiseCompareDocuments(fileMappings: FileMapping[], sendBackgroundMessage: (value: string, url: any) => Promise<any>, setMessages: (value: any) => void, crossValidation: (firstFile: FileMapping, secondFile: FileMapping) => Promise<void>): Promise<void>;
=======
export declare function pairwiseCompareDocuments(fileMappings: FileMapping[], comparePair: (firstFile: FileMapping, secondFile: FileMapping) => void, sendMessage: (value: string, url: any) => Promise<any>, setMessages: (value: any) => void, setLoading: (value: boolean) => void): void;
>>>>>>> 4b9e5b7 (feat: call loading bubble and add commercial invoice compliance)
=======
export declare function pairwiseCompareDocuments(fileMappings: FileMapping[], sendBackgroundMessage: (value: string, url: any) => Promise<any>, setMessages: (value: any) => void): Promise<void>;
>>>>>>> af64801 (refactor: specific compliance check)
=======
export declare function pairwiseCompareDocuments(fileMappings: FileMapping[], sendBackgroundMessage: (value: string, url: any) => Promise<any>, setMessages: (value: any) => void, crossValidationMethod: (firstFileMapping: FileMapping, secondFileMapping: FileMapping) => Promise<void>): Promise<void>;
>>>>>>> 349d60a (refactor: loading compliance)
//# sourceMappingURL=pairwiseComparisonUtils.d.ts.map