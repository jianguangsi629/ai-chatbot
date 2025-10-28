import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { isTestEnvironment } from "../constants";
import { getModelConfig, type ModelConfig } from "./models";

// Provider 实例缓存
type ProviderInstance = ReturnType<typeof createOpenAI> | ReturnType<typeof createGoogleGenerativeAI>;

const providerCache: Record<string, ProviderInstance | null> = {
  openrouter: null,
  gemini: null,
  deepseek: null,
};

// 初始化各个 provider
function initializeProviders() {
  if (typeof window !== "undefined") {
    // 客户端不初始化
    return;
  }

  // OpenRouter
  if (process.env.OPEN_ROUTER_API_KEY) {
    providerCache.openrouter = createOpenAI({
      apiKey: process.env.OPEN_ROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    });
  }

  // Gemini
  if (process.env.GEMINI_API_KEY) {
    providerCache.gemini = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  // DeepSeek (OpenAI-compatible)
  if (process.env.DEEPSEEK_API_KEY) {
    providerCache.deepseek = createOpenAI({
      name: "deepseek",
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: "https://api.deepseek.com",
    });
  }
}

// 根据 provider 类型获取对应的实例，如果不可用则降级到 Gemini
function getProviderInstance(
  providerType: ModelConfig["provider"]
): ProviderInstance {
  // 客户端返回占位 provider
  if (typeof window !== "undefined") {
    return createOpenAI({
      apiKey: "placeholder",
      baseURL: "https://api.openai.com/v1",
    });
  }

  const provider = providerCache[providerType];

  // 如果请求的 provider 不可用，尝试降级
  if (!provider) {
    console.warn(
      `⚠️  Provider "${providerType}" 不可用，降级到默认 provider`
    );

    // 降级顺序: Gemini -> OpenRouter -> DeepSeek
    if (providerCache.gemini) {
      console.log("  → 使用 Gemini 作为备用");
      return providerCache.gemini;
    }
    if (providerCache.openrouter) {
      console.log("  → 使用 OpenRouter 作为备用");
      return providerCache.openrouter;
    }
    if (providerCache.deepseek) {
      console.log("  → 使用 DeepSeek 作为备用");
      return providerCache.deepseek;
    }

    console.error("❌ 没有找到任何可用的 API key！");
    throw new Error(
      "No API key found. Please set OPEN_ROUTER_API_KEY, GEMINI_API_KEY, or DEEPSEEK_API_KEY in your environment variables."
    );
  }

  return provider;
}

// 根据前端传递的模型 ID 获取对应的 provider 和模型名称
export function getModelForChat(modelId: string) {
  const config = getModelConfig(modelId);
  const provider = getProviderInstance(config.provider);

  return {
    model: provider(config.modelName),
    modelName: config.modelName,
    provider: config.provider,
  };
}

// 自动检测并选择可用的 provider (保留用于向后兼容)
function getAvailableProvider() {
  // 在客户端，返回一个占位 provider（不会实际使用，因为 API 调用都在服务端）
  if (typeof window !== "undefined") {
    const placeholder = createOpenAI({
      apiKey: "placeholder",
      baseURL: "https://api.openai.com/v1",
    });
    return {
      provider: placeholder,
      chatModel: "gpt-4",
      reasoningModel: "gpt-4",
      titleModel: "gpt-4",
      artifactModel: "gpt-4",
    };
  }

  // 初始化所有 providers
  initializeProviders();

  // 优先级 1: OpenRouter
  if (providerCache.openrouter) {
    return {
      provider: providerCache.openrouter,
      chatModel: "google/gemini-2.0-flash-exp:free",
      reasoningModel: "google/gemini-2.0-flash-thinking-exp:free",
      titleModel: "google/gemini-2.0-flash-exp:free",
      artifactModel: "google/gemini-2.0-flash-exp:free",
    };
  }

  // 优先级 2: Gemini (默认)
  if (providerCache.gemini) {
    return {
      provider: providerCache.gemini,
      chatModel: "gemini-2.0-flash-exp",
      reasoningModel: "gemini-2.0-flash-thinking-exp-1219",
      titleModel: "gemini-2.0-flash-exp",
      artifactModel: "gemini-2.0-flash-exp",
    };
  }

  // 优先级 3: DeepSeek
  if (providerCache.deepseek) {
    return {
      provider: providerCache.deepseek,
      chatModel: "deepseek-chat",
      reasoningModel: "deepseek-reasoner",
      titleModel: "deepseek-chat",
      artifactModel: "deepseek-chat",
    };
  }

  console.error("❌ 没有找到任何 API key！");
  throw new Error(
    "No API key found. Please set OPEN_ROUTER_API_KEY, GEMINI_API_KEY, or DEEPSEEK_API_KEY in your environment variables."
  );
}

// 初始化 providers
initializeProviders();

// 构建所有模型的映射（包括前端模型 ID 和旧的固定模型名称）
function buildAllLanguageModels() {
  const config = getAvailableProvider();
  const models: Record<string, any> = {
    // 旧的固定模型名称（保持向后兼容）
    "chat-model": config.provider(config.chatModel),
    "chat-model-reasoning": wrapLanguageModel({
      model: config.provider(config.reasoningModel),
      middleware: extractReasoningMiddleware({ tagName: "think" }),
    }),
    "title-model": config.provider(config.titleModel),
    "artifact-model": config.provider(config.artifactModel),
  };

  // 添加所有前端模型 ID 的映射
  const { chatModels } = require("./models");
  for (const chatModel of chatModels) {
    try {
      const { model } = getModelForChat(chatModel.id);
      models[chatModel.id] = model;
    } catch (error) {
      // 如果获取模型失败，使用默认模型
      console.warn(`Failed to register model ${chatModel.id}:`, error);
      models[chatModel.id] = config.provider(config.chatModel);
    }
  }

  return models;
}

export const myProvider = isTestEnvironment
  ? (() => {
      const {
        artifactModel,
        chatModel,
        reasoningModel,
        titleModel,
      } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "chat-model-reasoning": reasoningModel,
          "title-model": titleModel,
          "artifact-model": artifactModel,
        },
      });
    })()
  : (() => {
      return customProvider({
        languageModels: buildAllLanguageModels(),
      });
    })();
