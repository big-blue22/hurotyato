import React, { useState, useRef, useCallback, MouseEvent, forwardRef, useEffect, WheelEvent } from 'react';
import type { FlowchartNode, FlowchartEdge, Point } from '../types';
import { Node } from './Node';
import { Edge } from './Edge';

interface FlowchartCanvasProps {
    nodes: FlowchartNode[];
    setNodes: React.Dispatch<React.SetStateAction<FlowchartNode[]>>;
    edges: FlowchartEdge[];
    setEdges: React.Dispatch<React.SetStateAction<FlowchartEdge[]>>;
    onNodeDoubleClick: (nodeId: string) => void;
    onEdgeDoubleClick: (edgeId: string) => void;
    selectedEdgeId: string | null;
    setSelectedEdgeId: (id: string | null) => void;
}

export const FlowchartCanvas = forwardRef<SVGSVGElement, FlowchartCanvasProps>(
  ({ nodes, setNodes, edges, setEdges, onNodeDoubleClick, onEdgeDoubleClick, selectedEdgeId, setSelectedEdgeId }, ref) => {
    const svgRef = ref as React.RefObject<SVGSVGElement>;

    // State for user interactions
    const [draggingNode, setDraggingNode] = useState<{ id: string; offset: Point } | null>(null);
    const [connecting, setConnecting] = useState<{ sourceId: string; startPos: Point } | null>(null);
    const [mousePosition, setMousePosition] = useState<Point>({ x: 0, y: 0 });
    
    // State for panning and zooming
    const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 800, height: 600 }); // Default fallback
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState<Point>({ x: 0, y: 0 });

    // Effect to initialize and update viewBox on resize
    useEffect(() => {
        const svgElement = svgRef.current;
        if (!svgElement) return;

        const observer = new ResizeObserver(entries => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                // Only update width/height, keep pan/zoom position
                setViewBox(prev => ({ ...prev, width, height }));
            }
        });
        observer.observe(svgElement);

        // Set initial size
        const { width, height } = svgElement.getBoundingClientRect();
        if (width > 0 && height > 0) {
            setViewBox({ x: 0, y: 0, width, height });
        }

        return () => observer.disconnect();
    }, [svgRef]);

    const getSVGPoint = useCallback((e: MouseEvent | WheelEvent): Point => {
        if (!svgRef.current) return { x: 0, y: 0 };
        const pt = svgRef.current.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const ctm = svgRef.current.getScreenCTM();
        if (!ctm) return { x: 0, y: 0 };
        const svgP = pt.matrixTransform(ctm.inverse());
        return { x: svgP.x, y: svgP.y };
    }, [svgRef]);

    const handleCanvasMouseDown = useCallback((e: MouseEvent<SVGSVGElement>) => {
        // Pan when clicking on the canvas background
        if (e.target === e.currentTarget) {
            setIsPanning(true);
            setPanStart({ x: e.clientX, y: e.clientY });
            setSelectedEdgeId(null);
        }
    }, [setSelectedEdgeId]);

    const handleMouseMove = useCallback((e: MouseEvent<SVGSVGElement>) => {
        const currentPos = getSVGPoint(e);
        setMousePosition(currentPos);

        if (draggingNode) {
            setNodes(prevNodes =>
                prevNodes.map(node =>
                    node.id === draggingNode.id
                        ? { ...node, position: { x: currentPos.x - draggingNode.offset.x, y: currentPos.y - draggingNode.offset.y } }
                        : node
                )
            );
        } else if (isPanning) {
            if (!svgRef.current) return;
            const dx = e.clientX - panStart.x;
            const dy = e.clientY - panStart.y;
            
            const scale = viewBox.width / svgRef.current.clientWidth;

            setViewBox(prev => ({
                ...prev,
                x: prev.x - dx * scale,
                y: prev.y - dy * scale,
            }));
            setPanStart({ x: e.clientX, y: e.clientY });
        }
    }, [draggingNode, isPanning, panStart, getSVGPoint, setNodes, viewBox.width, svgRef]);

    const handleMouseUp = useCallback(() => {
        setDraggingNode(null);
        setConnecting(null);
        setIsPanning(false);
    }, []);

    const handleWheel = useCallback((e: WheelEvent<SVGSVGElement>) => {
        e.preventDefault();
        const zoomFactor = 1.1;
        const { deltaY } = e;
        const mousePos = getSVGPoint(e);

        setViewBox(prev => {
            const newWidth = deltaY < 0 ? prev.width / zoomFactor : prev.width * zoomFactor;
            const newHeight = deltaY < 0 ? prev.height / zoomFactor : prev.height * zoomFactor;
            
            // Adjust x and y to zoom towards the mouse pointer
            const dx = (mousePos.x - prev.x) * (newWidth / prev.width - 1);
            const dy = (mousePos.y - prev.y) * (newHeight / prev.height - 1);

            return {
                x: prev.x - dx,
                y: prev.y - dy,
                width: newWidth,
                height: newHeight,
            };
        });
    }, [getSVGPoint]);

    // Node-specific event handlers
    const handleNodeMouseDown = useCallback((e: MouseEvent, node: FlowchartNode) => {
        e.stopPropagation();
        setSelectedEdgeId(null);
        const currentPos = getSVGPoint(e);
        setDraggingNode({
            id: node.id,
            offset: { x: currentPos.x - node.position.x, y: currentPos.y - node.position.y },
        });
    }, [getSVGPoint, setSelectedEdgeId]);

    const handleConnectorMouseDown = (e: MouseEvent, sourceId: string, startPos: Point) => {
        e.stopPropagation();
        setConnecting({ sourceId, startPos });
    };

    const handleNodeMouseUp = (_e: MouseEvent, targetId: string) => {
        // This function handles creating a connection when a drag-line is dropped on a node.
        // We removed `e.stopPropagation()` so the main canvas `onMouseUp` event will still fire
        // to properly terminate the drag/connect action.
        if (connecting && connecting.sourceId !== targetId) {
            const newEdge: FlowchartEdge = {
                id: `edge_${connecting.sourceId}_${targetId}_${Date.now()}`,
                source: connecting.sourceId,
                target: targetId,
            };
            // Prevent creating duplicate edges
            if (!edges.some(edge => edge.source === newEdge.source && edge.target === newEdge.target)) {
                 setEdges(prev => [...prev, newEdge]);
            }
        }
    };

    const nodeMap = React.useMemo(() => new Map(nodes.map(n => [n.id, n])), [nodes]);

    return (
        <svg
            ref={svgRef}
            className="w-full h-full cursor-grab active:cursor-grabbing bg-[radial-gradient(#2d3748_1px,transparent_1px)] [background-size:24px_24px]"
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        >
            <defs>
                <marker
                    id="arrowhead"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366f1" />
                </marker>
                 <marker
                    id="arrowhead-selected"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#f472b6" />
                </marker>
            </defs>

            {edges.map(edge => {
                const sourceNode = nodeMap.get(edge.source);
                const targetNode = nodeMap.get(edge.target);
                if (!sourceNode || !targetNode) return null;
                return <Edge 
                    key={edge.id} 
                    sourceNode={sourceNode} 
                    targetNode={targetNode} 
                    label={edge.label}
                    isSelected={edge.id === selectedEdgeId}
                    onClick={() => setSelectedEdgeId(edge.id)}
                    onDoubleClick={() => onEdgeDoubleClick(edge.id)}
                    />;
            })}

            {connecting && (
                <line
                    x1={connecting.startPos.x}
                    y1={connecting.startPos.y}
                    x2={mousePosition.x}
                    y2={mousePosition.y}
                    stroke="#a78bfa"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                />
            )}

            {nodes.map(node => (
                <Node
                    key={node.id}
                    node={node}
                    onMouseDown={handleNodeMouseDown}
                    onDoubleClick={() => onNodeDoubleClick(node.id)}
                    onConnectorMouseDown={handleConnectorMouseDown}
                    onMouseUp={handleNodeMouseUp}
                />
            ))}
        </svg>
    );
});