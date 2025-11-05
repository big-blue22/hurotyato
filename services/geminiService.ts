import { GoogleGenAI, Type } from "@google/genai";
import type { FlowchartNode, FlowchartEdge } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const flowchartSchema = {
    type: Type.OBJECT,
    properties: {
        nodes: {
            type: Type.ARRAY,
            description: "フローチャートのノードオブジェクトの配列。",
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING, description: "ノードの一意の識別子。例: 'node1'。" },
                    type: {
                        type: Type.STRING,
                        description: "ノードの種類。",
                        enum: ["creative", "general_affairs"],
                    },
                    text: { type: Type.STRING, description: "ノード内に表示するテキスト。" },
                    position: {
                        type: Type.OBJECT,
                        properties: {
                            x: { type: Type.INTEGER, description: "左上隅のX座標。" },
                            y: { type: Type.INTEGER, description: "左上隅のY座標。" },
                        },
                        required: ["x", "y"],
                    },
                },
                required: ["id", "type", "text", "position"],
            },
        },
    },
    required: ["nodes"],
};

const layoutSchema = {
     type: Type.ARRAY,
     description: "更新された位置情報を持つフローチャートノードオブジェクトの配列。",
     items: {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.STRING, description: "ノードの一意の識別子。" },
            type: { type: Type.STRING, description: "ノードの種類。" },
            text: { type: Type.STRING, description: "ノードのテキスト。" },
            position: {
                type: Type.OBJECT,
                properties: {
                    x: { type: Type.INTEGER, description: "更新されたX座標。" },
                    y: { type: Type.INTEGER, description: "更新されたY座標。" },
                },
                required: ["x", "y"],
            },
        },
        required: ["id", "type", "text", "position"],
    },
};


export const generateFlowchartFromText = async (description: string): Promise<{ nodes: FlowchartNode[], edges: FlowchartEdge[] }> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: description,
            config: {
                responseMimeType: 'application/json',
                responseSchema: flowchartSchema,
                systemInstruction: `あなたはテキスト記述からフローチャートのデータ構造を作成する専門家です。ユーザーのテキストを分析し、ノードの配列を含むJSONオブジェクトに変換してください。エッジ（線）は生成しないでください。原点(0,0)はキャンバスの左上です。ノードを論理的で、クリーンで、視覚的に魅力的なレイアウトで、十分な間隔を空けて配置してください。各ノードには短く簡潔なテキストラベルを作成してください。ブレインストーミング、デザイン、戦略など創造的なタスクには 'creative' タイプを、管理、物流、手続きなど事務的なタスクには 'general_affairs' タイプを使用してください。`
            }
        });
        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);
        return { nodes: data.nodes || [], edges: [] };
    } catch (e) {
        console.error("Error generating flowchart:", e);
        throw new Error("Failed to parse flowchart data from Gemini API.");
    }
};

export const autoLayoutFlowchart = async (nodes: FlowchartNode[], edges: FlowchartEdge[]): Promise<FlowchartNode[]> => {
    const currentData = JSON.stringify({ nodes, edges }, null, 2);

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `現在のフローチャートデータは次のとおりです: ${currentData}。レイアウトをクリーンで整理され、読みやすくするために、最適化された位置を持つ更新されたノード配列のみを提供してください。ID、テキスト、接続（エッジ）など、他のプロパティは変更しないでください。原点(0,0)は左上です。ノードが重ならず、適切な間隔が保たれるようにしてください。`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: layoutSchema,
                systemInstruction: `あなたはグラフのレイアウトアルゴリズムの専門家です。あなたのタスクは、フローチャートノードの 'position' を再配置して、クリーンで整理された、読みやすい図を作成することです。`
            }
        });
        
        const jsonText = response.text.trim();
        const updatedNodes = JSON.parse(jsonText);
        
        return updatedNodes;
    } catch (e) {
        console.error("Error with auto-layout:", e);
        throw new Error("Failed to get layout data from Gemini API.");
    }
};