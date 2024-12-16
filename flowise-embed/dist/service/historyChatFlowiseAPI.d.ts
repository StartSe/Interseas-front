interface Document {
    id: string;
    type: string;
    name: string;
    contents: any;
}
interface UsedTool {
    id: string;
    name: string;
    type: string;
    version: string;
}
interface FileAnnotation {
    id: string;
    type: string;
    name: string;
    contents: any;
}
interface AgentReasoning {
    id: string;
    type: string;
    content: string;
}
interface FileUpload {
    id: string;
    type: string;
    name: string;
    mime: string;
    contents: any;
}
interface Action {
    id: string;
    type: string;
    contents: any;
}
export interface ChatMessage {
    id: string;
    role: 'apiMessage' | 'userMessage' | 'selectionMessage';
    chatflowId: string;
    content: string;
    sourceDocuments: Document[] | null;
    usedTools: UsedTool[] | null;
    fileAnnotations: FileAnnotation[] | null;
    agentReasoning: AgentReasoning[] | null;
    fileUploads: FileUpload[] | null;
    action: Action[] | null;
    chatType: 'INTERNAL' | 'EXTERNAL';
    chatId: string;
    memoryType: string | null;
    sessionId: string | null;
    createdDate: string;
    leadEmail: string | null;
    disabled?: boolean;
}
export declare class historyChatFlowiseAPI {
    getFlowiseChatHistory(apiHost: string, chatFlowId: string, chatHistoryId: string): Promise<ChatMessage[]>;
}
export default historyChatFlowiseAPI;
//# sourceMappingURL=historyChatFlowiseAPI.d.ts.map