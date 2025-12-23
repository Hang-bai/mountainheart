
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

export const generateHikingStory = async (photoCount: number, shapeName: string, theme: string) => {
  // 按照准则，在函数内部初始化以获取最新 API Key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `我们完成了一次攀登，共有 ${photoCount} 位登山者贡献了照片，拼成了一个“${shapeName}”的形状。请写一段极具美感的短评（50-80字）。要求：1. 契合“${theme}”的主题；2. 像海子或席慕蓉的诗风；3. 适合作为朋友圈海报的配文；4. 巧妙地提到这个“${shapeName}”象征着我们共同的足迹；5. 意象阔大，情感真挚。`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        temperature: 0.9,
        topP: 0.8,
      },
    });
    
    // 确保返回的是文本
    return response.text || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    // 发生错误时抛出，让 UI 层处理
    throw error;
  }
};
