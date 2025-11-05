import React, { MouseEvent, useMemo } from 'react';
import type { FlowchartNode, Point } from '../types';

interface NodeProps {
    node: FlowchartNode;
    onMouseDown: (e: MouseEvent, node: FlowchartNode) => void;
    onDoubleClick: (nodeId: string) => void;
    onConnectorMouseDown: (e: MouseEvent, sourceId: string, startPos: Point) => void;
    onMouseUp: (e: MouseEvent, targetId: string) => void;
}

const NODE_DIMS = {
    creative: { width: 150, height: 70 },
    general_affairs: { width: 150, height: 70 },
};

export const Node: React.FC<NodeProps> = ({ node, onMouseDown, onDoubleClick, onConnectorMouseDown, onMouseUp }) => {
    const { id, type, text, position } = node;
    const { width, height } = NODE_DIMS[type];

    const connectors = useMemo(() => [
        { id: 'top', pos: { x: position.x + width / 2, y: position.y } },
        { id: 'bottom', pos: { x: position.x + width / 2, y: position.y + height } },
        { id: 'left', pos: { x: position.x, y: position.y + height / 2 } },
        { id: 'right', pos: { x: position.x + width, y: position.y + height / 2 } },
    ], [position, width, height]);

    const renderShape = () => {
        const commonProps = {
            onMouseDown: (e: MouseEvent) => onMouseDown(e, node),
            onMouseUp: (e: MouseEvent) => onMouseUp(e, id),
            onDoubleClick: () => onDoubleClick(id),
            className: "stroke-2 stroke-gray-400 hover:stroke-indigo-400 transition-all duration-200 cursor-pointer",
            filter: "url(#shadow)",
        };

        switch (type) {
            case 'creative':
                return <rect x={position.x} y={position.y} width={width} height={height} rx={8} fill="#a855f7" {...commonProps} />;
            case 'general_affairs':
                return <rect x={position.x} y={position.y} width={width} height={height} rx={8} fill="#3b82f6" {...commonProps} />;
            default:
                return null;
        }
    };
    
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    for(const word of words) {
        if((currentLine + word).length < 20) {
            currentLine += ` ${word}`;
        } else {
            lines.push(currentLine.trim());
            currentLine = word;
        }
    }
    lines.push(currentLine.trim());

    return (
        <g className="select-none group">
            <defs>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="3" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.5"/>
                </filter>
            </defs>
            {renderShape()}
            <foreignObject x={position.x} y={position.y} width={width} height={height}>
                <div className="w-full h-full flex items-center justify-center p-2"
                 onMouseDown={(e: React.MouseEvent) => onMouseDown(e as unknown as MouseEvent, node)}
                 onMouseUp={(e: React.MouseEvent) => onMouseUp(e as unknown as MouseEvent, id)}
                 onDoubleClick={() => onDoubleClick(id)}
                >
                    {/* FIX: Replaced incorrect use of <tspan> inside <p> with a standards-compliant method for multiline text in <foreignObject>. */}
                    <div className="text-white text-sm font-semibold text-center break-words pointer-events-none">
                        {lines.map((line, i) => <div key={i}>{line}</div>)}
                    </div>
                </div>
            </foreignObject>
            {connectors.map(c => (
                 <circle
                    key={c.id}
                    cx={c.pos.x}
                    cy={c.pos.y}
                    r="6"
                    fill="#cbd5e1"
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-crosshair"
                    onMouseDown={(e) => onConnectorMouseDown(e, id, c.pos)}
                />
            ))}
        </g>
    );
};