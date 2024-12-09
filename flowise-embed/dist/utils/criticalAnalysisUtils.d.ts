import { MessageType } from '@/components/Bot';
export declare const n8nCriticalAnalysisUrlSteps: string[];
export declare const getCriticalAnalysisStepResults: (criticalAnalysisStepUrl: string, ncmArray: string[], jsonDataCriticalAnalysis: any) => Promise<MessageType>;
export declare const criticalAnalysisRequest: (url: string, ncm: string, payload: any) => Promise<string>;
//# sourceMappingURL=criticalAnalysisUtils.d.ts.map