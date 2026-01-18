import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { GEMINI_MODEL, DEFAULT_SYSTEM_INSTRUCTION } from '../constants';
// Removed import of ChatMessage as types.ts no longer exports it

let chatSession: Chat | null = null;
let currentChatSystemInstruction: string = DEFAULT_SYSTEM_INSTRUCTION; // Track current instruction

const createGeminiService = () => {
  if (!process.env.API_KEY) {
    console.error("API_KEY is not defined. Please ensure it's set in your environment variables.");
    // In a real app, you might want to throw an error or handle this more gracefully.
  }

  // Always use process.env.API_KEY directly as per guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const startNewChatSession = (systemInstruction: string = DEFAULT_SYSTEM_INSTRUCTION) => {
    currentChatSystemInstruction = systemInstruction; // Update tracked instruction
    chatSession = ai.chats.create({
      model: GEMINI_MODEL,
      config: {
        systemInstruction: currentChatSystemInstruction,
      },
    });
  };

  // Initialize a session if one doesn't exist
  // or if the instruction has changed from a previous session (e.g., user changed role).
  if (!chatSession) {
    startNewChatSession();
  }

  const sendMessageToGemini = async (
    userMessage: string,
    systemInstruction: string = DEFAULT_SYSTEM_INSTRUCTION // Accept instruction
  ): Promise<AsyncIterable<GenerateContentResponse>> => {
    // Restart session if instruction changes or no session exists
    if (!chatSession || systemInstruction !== currentChatSystemInstruction) {
      console.warn("Chat session not initialized or system instruction changed. Starting a new one.");
      startNewChatSession(systemInstruction);
    }
    try {
      // Using sendMessageStream for real-time updates
      const streamResponse = await chatSession!.sendMessageStream({ message: userMessage });
      return streamResponse;
    } catch (error) {
      console.error("Error sending message to Gemini:", error);
      throw error;
    }
  };

  return { sendMessageToGemini, startNewChatSession }; // Export startNewChatSession
};

export const geminiService = createGeminiService();