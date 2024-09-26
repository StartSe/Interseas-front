export default class ParallelApiExecutor {
    private dependencies;
    n8nUrls: string[];
    constructor(dependencies: {
        jsonCriticalAnalysisUpdate: {
            text: string;
        };
        setMessages: (value: any) => void;
    });
    execute(): Promise<void>;
    private sendMessageToChat;
}
//# sourceMappingURL=parallelApiExecutor.d.ts.map