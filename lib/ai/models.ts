export const DEFAULT_CHAT_MODEL: string = "gemini-flash";

export type ChatModel = {
  id: string;
  name: string;
  description: string;
  provider?: string;
};

export const chatModels: ChatModel[] = [
  // Gemini models (default)
  {
    id: "gemini-flash",
    name: "Gemini Flash",
    description:
      "Fast and efficient multimodal model with vision and text capabilities",
    provider: "gemini",
  },
  {
    id: "gemini-flash-thinking",
    name: "Gemini Flash Thinking",
    description: "Advanced reasoning model with chain-of-thought capabilities",
    provider: "gemini",
  },

  // OpenRouter models
  {
    id: "openrouter-gemini-flash",
    name: "OpenRouter Gemini Flash",
    description: "Gemini Flash via OpenRouter (free tier)",
    provider: "openrouter",
  },
  {
    id: "openrouter-gemini-thinking",
    name: "OpenRouter Gemini Thinking",
    description: "Gemini Thinking via OpenRouter (free tier)",
    provider: "openrouter",
  },

  // DeepSeek models
  {
    id: "deepseek-chat",
    name: "DeepSeek Chat",
    description: "Powerful and cost-effective chat model",
    provider: "deepseek",
  },
  {
    id: "deepseek-reasoner",
    name: "DeepSeek Reasoner",
    description: "Advanced reasoning capabilities for complex problems",
    provider: "deepseek",
  },

  // Placeholder for future models (保留选项)
  {
    id: "grok-vision",
    name: "Grok Vision",
    description: "Advanced multimodal model (coming soon)",
    provider: "grok",
  },
  {
    id: "openai-gpt4",
    name: "GPT-4",
    description: "OpenAI GPT-4 (coming soon)",
    provider: "openai",
  },
];

// 模型 ID 到实际模型名称的映射
export type ModelConfig = {
  provider: "gemini" | "openrouter" | "deepseek" | "grok" | "openai";
  modelName: string;
  reasoningModelName?: string;
};

export const modelIdToConfig: Record<string, ModelConfig> = {
  // Gemini models
  "gemini-flash": {
    provider: "gemini",
    modelName: "gemini-2.0-flash-exp",
  },
  "gemini-flash-thinking": {
    provider: "gemini",
    modelName: "gemini-2.0-flash-thinking-exp-1219",
  },

  // OpenRouter models
  "openrouter-gemini-flash": {
    provider: "openrouter",
    modelName: "google/gemini-2.0-flash-exp:free",
  },
  "openrouter-gemini-thinking": {
    provider: "openrouter",
    modelName: "google/gemini-2.0-flash-thinking-exp:free",
  },

  // DeepSeek models
  "deepseek-chat": {
    provider: "deepseek",
    modelName: "deepseek-chat",
  },
  "deepseek-reasoner": {
    provider: "deepseek",
    modelName: "deepseek-reasoner",
  },

  // Placeholder models (会降级到 Gemini)
  "grok-vision": {
    provider: "grok",
    modelName: "grok-vision", // 不支持，会降级
  },
  "openai-gpt4": {
    provider: "openai",
    modelName: "gpt-4", // 不支持，会降级
  },
};

// 获取模型配置，如果不存在则返回默认的 Gemini Flash
export function getModelConfig(modelId: string): ModelConfig {
  return (
    modelIdToConfig[modelId] || {
      provider: "gemini",
      modelName: "gemini-2.0-flash-exp",
    }
  );
}
