import React, { useState, useCallback, useRef, MouseEvent, useEffect } from 'react';
import type { FlowchartNode, FlowchartEdge, NodeType } from './types';
import { Toolbar } from './components/Toolbar';
import { FlowchartCanvas } from './components/FlowchartCanvas';
import { generateFlowchartFromText, autoLayoutFlowchart } from './services/geminiService';
import { LoadingSpinner } from './components/LoadingSpinner';
import { EditNodeModal } from './components/EditNodeModal';
import { EditEdgeModal } from './components/EditEdgeModal';
import { StartScreen } from './components/StartScreen';

const App: React.FC = () => {
    const [nodes, setNodes] = useState<FlowchartNode[]>([]);
    const [edges, setEdges] = useState<FlowchartEdge[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
    const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);
    const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

    const canvasRef = useRef<SVGSVGElement>(null);

    const handleDeleteSelectedEdge = useCallback(() => {
        if (selectedEdgeId) {
            setEdges(prevEdges => prevEdges.filter(edge => edge.id !== selectedEdgeId));
            setSelectedEdgeId(null);
        }
    }, [selectedEdgeId]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedEdgeId) {
                handleDeleteSelectedEdge();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedEdgeId, handleDeleteSelectedEdge]);


    const handleGenerateFromText = useCallback(async (description: string) => {
        if (!description) return;
        setIsLoading(true);
        setLoadingMessage('説明からフローチャートを生成中...');
        try {
            const { nodes: newNodes, edges: newEdges } = await generateFlowchartFromText(description);
            setNodes(newNodes);
            setEdges(newEdges);
        } catch (error) {
            console.error("Failed to generate flowchart:", error);
            alert("申し訳ありませんが、その説明からフローチャートを生成できませんでした。別の表現で試してください。");
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, []);

    const handleAutoLayout = useCallback(async () => {
        if (nodes.length === 0) return;
        setIsLoading(true);
        setLoadingMessage('フローチャートのレイアウトを最適化中...');
        try {
            const updatedNodes = await autoLayoutFlowchart(nodes, edges);
            const nodeMap = new Map(updatedNodes.map(n => [n.id, n]));
            setNodes(currentNodes => currentNodes.map(n => ({...n, position: nodeMap.get(n.id)?.position || n.position })));
        } catch (error) {
            console.error("Failed to auto-layout flowchart:", error);
            alert("申し訳ありませんが、フローチャートを自動レイアウトできませんでした。もう一度お試しください。");
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, [nodes, edges]);

    const handleAddNode = useCallback((type: NodeType) => {
        const nodeTextMap: Record<NodeType, string> = {
            creative: 'クリエイティブタスク',
            general_affairs: '総務タスク',
        };
        const newNode: FlowchartNode = {
            id: `node_${Date.now()}`,
            type,
            position: { x: 150, y: 150 },
            text: nodeTextMap[type],
        };
        setNodes(prev => [...prev, newNode]);
    }, []);

    const handleNodeTextChange = (nodeId: string, newText: string) => {
        setNodes(prevNodes => prevNodes.map(node =>
            node.id === nodeId ? { ...node, text: newText } : node
        ));
        setEditingNodeId(null);
    };

    const handleEdgeLabelChange = (edgeId: string, newLabel: string) => {
        setEdges(prevEdges => prevEdges.map(edge =>
            edge.id === edgeId ? { ...edge, label: newLabel } : edge
        ));
        setEditingEdgeId(null);
    };

    const hasContent = nodes.length > 0;

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white font-sans">
            <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 p-2 z-20">
                <h1 className="text-xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
                    フローチャートAI
                </h1>
            </header>
            <div className="flex-grow flex relative overflow-hidden">
                <Toolbar
                    onAddNode={handleAddNode}
                    onGenerate={handleGenerateFromText}
                    onAutoLayout={handleAutoLayout}
                    isLayoutDisabled={nodes.length < 2}
                    onDeleteEdge={handleDeleteSelectedEdge}
                    isDeleteDisabled={!selectedEdgeId}
                />
                <main className="flex-grow h-full relative bg-gray-900">
                     {isLoading && <LoadingSpinner message={loadingMessage} />}
                    <FlowchartCanvas
                        ref={canvasRef}
                        nodes={nodes}
                        setNodes={setNodes}
                        edges={edges}
                        setEdges={setEdges}
                        onNodeDoubleClick={setEditingNodeId}
                        onEdgeDoubleClick={setEditingEdgeId}
                        selectedEdgeId={selectedEdgeId}
                        setSelectedEdgeId={setSelectedEdgeId}
                    />
                    {!hasContent && !isLoading && (
                        <StartScreen onGenerate={handleGenerateFromText}/>
                    )}
                </main>
            </div>
            {editingNodeId && (
                <EditNodeModal
                    node={nodes.find(n => n.id === editingNodeId)!}
                    onSave={handleNodeTextChange}
                    onClose={() => setEditingNodeId(null)}
                />
            )}
             {editingEdgeId && (
                <EditEdgeModal
                    edge={edges.find(e => e.id === editingEdgeId)!}
                    onSave={handleEdgeLabelChange}
                    onClose={() => setEditingEdgeId(null)}
                />
            )}
        </div>
    );
};

export default App;