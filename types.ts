export type NodeType = 'creative' | 'general_affairs';

export interface Point {
    x: number;
    y: number;
}

export interface FlowchartNode {
    id: string;
    type: NodeType;
    text: string;
    position: Point;
}

export interface FlowchartEdge {
    id: string;
    source: string;
    target: string;
    label?: string;
}