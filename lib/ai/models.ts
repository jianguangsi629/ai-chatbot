export const DEFAULT_CHAT_MODEL: string = "gemini-flash";

export type ChatModel = {
  id: string;
  name: string;
  description: string;
};

export const chatModels: ChatModel[] = [
  {
    id: "chat-model",
    name: "Grok Vision",
    description: "Advanced multimodal model with vision and text capabilities",
  },
  {
    id: "chat-model-reasoning",
    name: "Grok Reasoning",
    description:
      "Uses advanced chain-of-thought reasoning for complex problems",
  },
  {
    id: "gemini-flash",
    name: "Gemini 2.0 Flash",
    description: "Google's latest fast and efficient multimodal AI model",
  },
  {
    id: "gemini-pro",
    name: "Gemini 1.5 Pro",
    description:
      "Google's advanced multimodal AI model with enhanced capabilities",
  },
  {
    id: "deepseek-chat",
    name: "DeepSeek Chat",
    description: "High-performance conversational AI model",
  },
  {
    id: "deepseek-coder",
    name: "DeepSeek Coder",
    description: "Specialized AI model optimized for coding tasks",
  },
];
