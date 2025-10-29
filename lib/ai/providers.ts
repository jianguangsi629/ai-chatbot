import { deepseek } from "@ai-sdk/deepseek";
import { gateway } from "@ai-sdk/gateway";
import { google } from "@ai-sdk/google";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { isTestEnvironment } from "../constants";

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
          "gemini-flash": chatModel, // Mock for testing
          "deepseek-chat": chatModel, // Mock for testing
        },
      });
    })()
  : customProvider({
      languageModels: {
        // Default Grok models (require AI Gateway)
        "chat-model": gateway.languageModel("xai/grok-2-vision-1212"),
        "chat-model-reasoning": wrapLanguageModel({
          model: gateway.languageModel("xai/grok-3-mini"),
          middleware: extractReasoningMiddleware({ tagName: "think" }),
        }),

        // Use Gemini for title and artifact generation (no Gateway needed)
        "title-model": google("gemini-2.0-flash-exp"),
        "artifact-model": google("gemini-2.0-flash-exp"),

        // Gemini models
        "gemini-flash": google("gemini-2.0-flash-exp"),
        "gemini-pro": google("gemini-1.5-pro-latest"),

        // DeepSeek models
        "deepseek-chat": deepseek("deepseek-chat"),
        "deepseek-coder": deepseek("deepseek-coder"),
      },
    });
