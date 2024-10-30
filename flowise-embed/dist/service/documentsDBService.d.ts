import { Flow } from '@/features/bubble/types';
interface DocumentData {
    file_name?: string;
    file_extension?: string;
    hash: string;
    checklist_result?: any;
    extraction_result?: any;
    pdf_to_text?: string;
    checklist_type?: string;
    agent_flow: string;
}
declare class DocumentsDBService {
    private sendDataToN8n;
    private getDocumentFromDBByHash;
    saveDocument(documentData: DocumentData): Promise<void>;
    isHashInDatabase(hash: string, agentFlow: Flow): Promise<boolean>;
    extractDocumentData(fileMap: any, textContent: any, agentFlow: Flow, agentResult?: any): Promise<DocumentData>;
    saveDocumentData(documentData: DocumentData): Promise<void>;
    saveExtractedDataToDatabase(fileMap: any, textContent: any, agentFlow: Flow, agentResult?: any): Promise<void>;
    checkDocumentHash(hashPdf: any, agentFlow: Flow): Promise<any>;
    checkDocumentForAlreadyProcessedData(fileMap: any, agentFlow: Flow): Promise<any>;
}
export default DocumentsDBService;
//# sourceMappingURL=documentsDBService.d.ts.map