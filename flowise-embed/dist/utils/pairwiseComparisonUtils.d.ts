import { FileMapping } from '@/utils/fileUtils';
export declare function pairwiseCompareDocuments(fileMappings: FileMapping[], sendBackgroundMessage: (value: string, url: any) => Promise<any>, setMessages: (value: any) => void, crossValidation: (firstFile: FileMapping, secondFile: FileMapping) => Promise<void>): Promise<void>;
//# sourceMappingURL=pairwiseComparisonUtils.d.ts.map