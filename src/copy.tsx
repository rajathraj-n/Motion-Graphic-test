import React, { createContext, useContext } from "react";

/** Every line of on-screen text. Edit here, in Studio's props panel, or in the web editor. */
export const DEFAULT_COPY = {
  hookHeadline: "Everything starts with an idea.",
  meetHeadline: "Meet ChatGPT.",
  meetSub: "Your ideas. Reimagined.",
  meetPrompt: "Help me turn an idea into something great.",
  meetResponse:
    "Absolutely — let's shape it together. Share the spark, and I'll help you define the audience, sharpen the story, and map the first steps to bring it to life.",
  createHeadline: "Create without limits.",
  createPrompt: "Write a creative marketing campaign for a new product.",
  thinkHeadline: "Turn complexity into clarity.",
  thinkPrompt: "Analyze this sales data and highlight key insights.",
  imagineHeadline: "Bring imagination to life.",
  imaginePrompt: "Create a futuristic city surrounded by nature.",
  workspaceWords: "Write. Think. Create. Discover.",
  payoffLine1: "Less friction.",
  payoffLine2: "More possibilities.",
  brandName: "ChatGPT",
  brandTagline: "Start with a conversation.",
  brandUrl: "chatgpt.com",
};

export type Copy = typeof DEFAULT_COPY;

const CopyContext = createContext<Copy>(DEFAULT_COPY);

export const CopyProvider: React.FC<{ copy?: Partial<Copy>; children: React.ReactNode }> = ({ copy, children }) => (
  <CopyContext.Provider value={{ ...DEFAULT_COPY, ...copy }}>{children}</CopyContext.Provider>
);

export const useCopy = () => useContext(CopyContext);
