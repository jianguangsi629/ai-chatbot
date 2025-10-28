import type { UserType } from "@/app/(auth)/auth";
import type { ChatModel } from "./models";

type Entitlements = {
  maxMessagesPerDay: number;
  availableChatModelIds: ChatModel["id"][];
};

export const entitlementsByUserType: Record<UserType, Entitlements> = {
  /*
   * For users without an account
   */
  guest: {
    maxMessagesPerDay: 1000,
    availableChatModelIds: [
      "gemini-flash",
      "gemini-flash-thinking",
      "openrouter-gemini-flash",
      "openrouter-gemini-thinking",
      "deepseek-chat",
      "deepseek-reasoner",
      "grok-vision",
      "openai-gpt4",
    ],
  },

  /*
   * For users with an account
   */
  regular: {
    maxMessagesPerDay: 1000,
    availableChatModelIds: [
      "gemini-flash",
      "gemini-flash-thinking",
      "openrouter-gemini-flash",
      "openrouter-gemini-thinking",
      "deepseek-chat",
      "deepseek-reasoner",
      "grok-vision",
      "openai-gpt4",
    ],
  },

  /*
   * TODO: For users with an account and a paid membership
   */
};
