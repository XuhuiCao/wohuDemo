import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

class GeminiService {
  /**
   * Helper to handle and parse Gemini API errors.
   */
  private handleError(error: any): never {
    const errorString = typeof error === 'string' ? error : JSON.stringify(error);
    
    if (errorString.includes("RESOURCE_EXHAUSTED") || error.status === 429) {
      const e = new Error("您的 API 配额已耗尽 (Quota Exceeded)。请检查 Google AI Studio 的账单或配额设置，或换一个 API Key。");
      (e as any).status = 429;
      throw e;
    }

    if (errorString.includes("Requested entity was not found")) {
      const e = new Error("API Key 校验失败。请重新选择有效的 API Key。"); 
      (e as any).status = 404;
      throw e;
    }

    console.error("Gemini API Error:", error);
    throw error;
  }

  /**
   * Non-streaming wrapper with simple retry logic for 429s.
   */
  private async withRetry<T>(fn: () => Promise<T>, retries = 1): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      if (retries > 0 && error.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.withRetry(fn, retries - 1);
      }
      throw error;
    }
  }

  /**
   * Gets a fresh client instance.
   */
  private getClient() {
    const apiKey = process.env.API_KEY;
    return new GoogleGenAI({ apiKey: apiKey || "" });
  }

  async sendMessageStream(message: string, history: any[] = []): Promise<AsyncIterable<GenerateContentResponse> | null> {
    const ai = this.getClient();
    // Re-create chat session with history to ensure we use the latest API key
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      history: history,
      config: {
        systemInstruction: "你是一个名为“卧虎”的 AI 助手。你可以帮助用户构建智能体、编写代码和回答问题。请保持回答专业、简洁。",
      }
    });

    try {
      return await chat.sendMessageStream({ message });
    } catch (error) {
      return this.handleError(error);
    }
  }

  async generateAgentConfig(prompt: string) {
    return this.withRetry(async () => {
      try {
          const ai = this.getClient();
          const response = await ai.models.generateContent({
              model: 'gemini-3-flash-preview',
              contents: `Generate a JSON configuration for an AI agent based on this description: "${prompt}". 
              Return JSON with keys: name, description, systemPrompt, suggestedModels (array). 
              Do not include markdown formatting like \`\`\`json. Just the raw JSON string.`
          });
          return response.text;
      } catch (e) {
          return this.handleError(e);
      }
    }).catch(err => {
      console.error("Agent generation failed", err);
      return null;
    });
  }
}

export const geminiService = new GeminiService();