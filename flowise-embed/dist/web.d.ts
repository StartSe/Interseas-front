declare const chatbot: {
    initFull: (props: {
        chatflowid: string;
        apiHost?: string | undefined;
        onRequest?: ((request: RequestInit) => Promise<void>) | undefined;
        chatflowConfig?: Record<string, unknown> | undefined;
        observersConfig?: import("./components/Bot").observersConfigType | undefined;
        theme?: import("./features/bubble/types").BubbleTheme | undefined;
    } & {
        id?: string | undefined;
    }) => void;
    init: (props: {
        chatflowid: string;
        apiHost?: string | undefined;
        onRequest?: ((request: RequestInit) => Promise<void>) | undefined;
        chatflowConfig?: Record<string, unknown> | undefined;
        observersConfig?: import("./components/Bot").observersConfigType | undefined;
        theme?: import("./features/bubble/types").BubbleTheme | undefined;
    }) => void;
    destroy: () => void;
    initMenu: (props: import("./features/menu").MenuProps) => void;
    initHome: (props: import("./pages/Home/Home").HomeProps) => void;
};
export default chatbot;
//# sourceMappingURL=web.d.ts.map