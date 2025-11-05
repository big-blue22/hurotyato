import React, { useState, useEffect } from 'react';
import type { FlowchartEdge } from '../types';

interface EditEdgeModalProps {
    edge: FlowchartEdge;
    onSave: (edgeId: string, newLabel: string) => void;
    onClose: () => void;
}

export const EditEdgeModal: React.FC<EditEdgeModalProps> = ({ edge, onSave, onClose }) => {
    const [label, setLabel] = useState(edge.label || '');

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleSave = () => {
        onSave(edge.id, label);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-white">線のラベルを編集</h2>
                <textarea
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="ラベルテキスト..."
                    className="w-full h-24 p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                    autoFocus
                />
                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-md transition-colors"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-md transition-colors"
                    >
                        保存
                    </button>
                </div>
            </div>
        </div>
    );
};