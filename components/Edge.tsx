import React from 'react';
import type { FlowchartNode } from '../types';

interface EdgeProps {
    sourceNode: FlowchartNode;
    targetNode: FlowchartNode;
    label?: string;
    isSelected: boolean;
    onClick: () => void;
    onDoubleClick: () => void;
}

const NODE_DIMS = {
    creative: { width: 150, height: 70 },
    general_affairs: { width: 150, height: 70 },
};

export const Edge: React.FC<EdgeProps> = ({ sourceNode, targetNode, label, isSelected, onClick, onDoubleClick }) => {
    const sourceDims = NODE_DIMS[sourceNode.type];
    const targetDims = NODE_DIMS[targetNode.type];

    const sx = sourceNode.position.x + sourceDims.width / 2;
    const sy = sourceNode.position.y + sourceDims.height / 2;
    const tx = targetNode.position.x + targetDims.width / 2;
    const ty = targetNode.position.y + targetDims.height / 2;

    const midX = (sx + tx) / 2;
    const midY = (sy + ty) / 2;
    const labelContainerWidth = 120;
    const labelContainerHeight = 40;

    return (
        <g
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            onDoubleClick={(e) => { e.stopPropagation(); onDoubleClick(); }}
            className="cursor-pointer"
        >
            {/* Invisible wider path for easier clicking */}
            <path
                d={`M ${sx},${sy} L ${tx},${ty}`}
                stroke="transparent"
                strokeWidth="15"
                fill="none"
            />
            <path
                d={`M ${sx},${sy} L ${tx},${ty}`}
                stroke={isSelected ? '#f472b6' : '#6366f1'}
                strokeWidth={isSelected ? '3' : '2'}
                fill="none"
                markerEnd={isSelected ? "url(#arrowhead-selected)" : "url(#arrowhead)"}
                style={{ transition: 'stroke 0.2s, strokeWidth 0.2s' }}
            />
            {label && (
                <foreignObject
                    x={midX - labelContainerWidth / 2}
                    y={midY - labelContainerHeight / 2}
                    width={labelContainerWidth}
                    height={labelContainerHeight}
                    className="pointer-events-none"
                >
                    <div className="w-full h-full flex items-center justify-center p-1">
                       <div className="px-2 py-1 rounded-md bg-gray-800 bg-opacity-80">
                            <p className="text-white text-xs text-center break-words">
                                {label}
                            </p>
                        </div>
                    </div>
                </foreignObject>
            )}
        </g>
    );
};