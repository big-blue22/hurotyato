import React, { useState } from 'react';
import type { NodeType } from '../types';

interface ToolbarProps {
    onAddNode: (type: NodeType) => void;
    onGenerate: (description: string) => void;
    onAutoLayout: () => void;
    isLayoutDisabled: boolean;
    onDeleteEdge: () => void;
    isDeleteDisabled: boolean;
}

// FIX: Changed icon type from JSX.Element to React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
const NodeButton: React.FC<{ type: NodeType, label: string, icon: React.ReactElement, onClick: (type: NodeType) => void }> = ({ type, label, icon, onClick }) => (
    <button
        onClick={() => onClick(type)}
        className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 w-24 h-24 text-center"
        title={`「${label}」ノードを追加`}
    >
        {icon}
        <span className="text-xs mt-1">{label}</span>
    </button>
);

const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);


export const Toolbar: React.FC<ToolbarProps> = ({ onAddNode, onGenerate, onAutoLayout, isLayoutDisabled, onDeleteEdge, isDeleteDisabled }) => {
    const [description, setDescription] = useState('');

    const handleGenerate = () => {
        onGenerate(description);
        setDescription('');
    };
    
    return (
        <aside className="w-64 bg-gray-800/70 backdrop-blur-sm p-4 z-10 border-r border-gray-700 flex flex-col space-y-6">
            <div>
                <h2 className="text-sm font-semibold text-gray-400 mb-3">AIアシスタント</h2>
                <div className="flex flex-col space-y-2">
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="ここにプロセスを記述してください..."
                        className="w-full h-32 p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                    <button
                        onClick={handleGenerate}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
                        disabled={!description.trim()}
                    >
                        フローチャートを生成
                    </button>
                     <button
                        onClick={onAutoLayout}
                        disabled={isLayoutDisabled}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                        自動レイアウト
                    </button>
                    <button
                        onClick={onDeleteEdge}
                        disabled={isDeleteDisabled}
                        className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        <TrashIcon />
                        線を削除
                    </button>
                </div>
            </div>
            
            <div>
                 <h2 className="text-sm font-semibold text-gray-400 mb-3">ノードを追加</h2>
                 <div className="grid grid-cols-2 gap-2">
                     <NodeButton type="creative" label="クリエイティブ" icon={<svg viewBox="0 0 100 60" className="w-10 h-10 text-purple-400"><rect x="0" y="0" width="100" height="60" rx="8" fill="currentColor" /></svg>} onClick={onAddNode} />
                     <NodeButton type="general_affairs" label="総務" icon={<svg viewBox="0 0 100 60" className="w-10 h-10 text-blue-400"><rect x="0" y="0" width="100" height="60" rx="8" fill="currentColor" /></svg>} onClick={onAddNode} />
                 </div>
            </div>
        </aside>
    );
};