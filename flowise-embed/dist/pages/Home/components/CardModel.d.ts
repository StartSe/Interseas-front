import { Component } from 'solid-js';
export interface CardModelProps {
    flow: string;
    title: string;
    onClick?: () => void;
    bgImage: string;
    onFlowChange?: (flow: string) => void;
}
export declare const CardModel: Component<CardModelProps>;
//# sourceMappingURL=CardModel.d.ts.map