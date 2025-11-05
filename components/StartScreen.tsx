import React, { useState } from 'react';

interface StartScreenProps {
    onGenerate: (description: string) => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onGenerate }) => {
    const [description, setDescription] = useState('');

    const handleGenerateClick = () => {
        if (description.trim()) {
            onGenerate(description);
        }
    };

    const handleSampleClick = (sample: string) => {
        setDescription(sample);
    };

    const samplePrompts = [
        "ユーザーがログインし、ダッシュボードを見て、プロフィールをクリックし、情報を編集して保存する。",
        "顧客がオンラインで注文します。システムは在庫を確認します。在庫があれば支払いを処理します。なければ在庫切れメッセージを表示します。",
        "お茶を入れるプロセスを概説してください。お湯を沸かすところから牛乳を入れるところまで。"
    ];
    
    return (
        <div className="absolute inset-0 flex items-center justify-center z-0 p-8">
            <div className="text-center max-w-2xl">
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500 mb-4">フローチャートAIへようこそ</h1>
                <p className="text-lg text-gray-400 mb-8">
                    プロセスを説明すれば、AIが即座にフローチャートを作成します。または、左のツールを使って手動で作成することもできます。
                </p>
                
                <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg">
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="例：ユーザーがアカウントにサインアップし、確認メールを受信し、リンクをクリックしてアカウントを確認します..."
                        className="w-full h-28 p-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-200 resize-none"
                    />
                    <button
                        onClick={handleGenerateClick}
                        className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-md transition-colors duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed text-lg"
                        disabled={!description.trim()}
                    >
                        ✨ AIで生成
                    </button>
                    <div className="mt-4 text-left">
                        <p className="text-sm text-gray-500 mb-2">または、例を試してみてください：</p>
                        <div className="flex flex-wrap gap-2">
                            {samplePrompts.map((prompt, i) => (
                                <button key={i} onClick={() => handleSampleClick(prompt)} className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded-full transition-colors">
                                    {prompt.substring(0, 30)}...
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}