import { Flow } from '@/features/bubble/types';
declare class DocumentsDBService {
    private sendDataToN8n;
    private getDocumentFromDBByHash;
    private fetchChatDocumentRelation;
    private fetchDocumentsByChatId;
    private fetchChatIdsForFlow;
    private sendDeleteChatRequest;
    private sendUpdateChatRequest;
    private sendDataToDBThroughN8n;
    private isHashInDatabase;
    private isChatIdInDatabase;
    private doesChatDocumentRelationExist;
    private retrieveChatIdsForFlow;
    private removeChat;
    private updateChat;
    private extractDocumentData;
    saveChatData(chatData: any): Promise<void>;
    saveDocumentData(fileMap: any, textContent: any, agentFlow: Flow, chatId: any, agentResult?: any): Promise<void>;
    getDocumentsByChatId(chatId: any): Promise<any>;
    saveChatDocumentData(chatId: any, documentId: string): Promise<void>;
    checkDocumentHash(hashPdf: any, agentFlow: Flow, chatId: any): Promise<boolean>;
    getProcessedDocumentData(fileMap: any, agentFlow: Flow, chatId: any): Promise<string | null>;
    getChatIdsByFlow(flow: string): Promise<string | null>;
    deleteChat(chatId: string): Promise<void>;
    updateChatName(chatId: string, chatName: string): Promise<string | null>;
}
export default DocumentsDBService;
//# sourceMappingURL=documentsDBService.d.ts.map