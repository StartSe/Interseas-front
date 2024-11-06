import { Flow } from '@/features/bubble/types';
interface DocumentData {
    id: string;
    file_name?: string;
    mime_type?: string;
    hash: string;
    extraction_result?: any;
    checklist_result?: any;
    pdf_to_text?: string;
    version?: any;
    checklist_type?: string;
    agent_flow: string;
}
declare class DocumentsDBService {
    private sendDataToN8n;
    private getDocumentFromDBByHash;
    private sendDataToDBThroughN8n;
    isHashInDatabase(hash: string, agentFlow: Flow): Promise<boolean>;
    extractDocumentData(fileMap: any, textContent: any, agentFlow: Flow, agentResult?: any): Promise<DocumentData>;
    saveChatData(chatData: any): Promise<void>;
    saveDocumentData(fileMap: any, textContent: any, agentFlow: Flow, chatId: any, agentResult?: any): Promise<void>;
    saveChatDocumentData(chatId: any, documentId: string): Promise<void>;
    checkDocumentHash(hashPdf: any, agentFlow: Flow): Promise<any>;
    checkDocumentForAlreadyProcessedData(fileMap: any, agentFlow: Flow): Promise<any>;
}
export default DocumentsDBService;
//# sourceMappingURL=documentsDBService.d.ts.map