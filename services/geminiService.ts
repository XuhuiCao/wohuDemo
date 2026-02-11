import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

class GeminiService {
  private ai: GoogleGenAI | null = null;
  private chat: Chat | null = null;

  constructor() {
    this.refreshClient();
  }

  /**
   * Re-initializes the GoogleGenAI client with the latest environment API key.
   */
  public refreshClient() {
    const apiKey = process.env.API_KEY;
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    }
  }

  /**
   * Helper to handle and parse Gemini API errors.
   */
  private handleError(error: any): never {
    const errorString = typeof error === 'string' ? error : JSON.stringify(error);
    
    // Check for specific error patterns defined in guidelines
    if (errorString.includes("RESOURCE_EXHAUSTED") || error.status === 429) {
      const e = new Error("您的 API 配额已耗尽 (Quota Exceeded)。请检查 Google AI Studio 的账单或配额设置，或稍后再试。");
      (e as any).status = 429;
      throw e;
    }

    if (errorString.includes("Requested entity was not found")) {
      const e = new Error("Requested entity was not found."); // Guidelines specify this exact string for re-triggering key selection
      (e as any).status = 404;
      throw e;
    }

    console.error("Gemini API Error:", error);
    throw error;
  }

  /**
   * Non-streaming wrapper with simple retry logic for non-transient errors.
   */
  private async withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      if (retries > 0 && error.status === 429) {
        const delay = (3 - retries) * 2000; // Exponential backoff: 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.withRetry(fn, retries - 1);
      }
      throw error;
    }
  }

  initializeChat(history: { role: 'user' | 'model'; parts: [{ text: string }] }[] = []) {
    if (!this.ai) this.refreshClient();
    if (!this.ai) return;
    
    this.chat = this.ai.chats.create({
      model: 'gemini-3-flash-preview',
      history: history, 
      config: {
        systemInstruction: "你是一个名为“卧虎”的 AI 助手。你可以帮助用户构建智能体、编写代码和回答问题。请保持回答专业、简洁。",
      }
    });
  }

  async sendMessageStream(message: string): Promise<AsyncIterable<GenerateContentResponse> | null> {
    if (!this.chat) {
       this.initializeChat();
    }
    if (!this.chat) return null;

    try {
      return await this.chat.sendMessageStream({ message });
    } catch (error) {
      return this.handleError(error);
    }
  }

  async generateAgentConfig(prompt: string) {
    if (!this.ai) this.refreshClient();
    if (!this.ai) return null;

    return this.withRetry(async () => {
      try {
          const response = await this.ai!.models.generateContent({
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
      console.error("Agent generation failed after retries", err);
      return null;
    });
  }
}

export const geminiService = new GeminiService();