// export interface ChatMessage {
//   id: string;
//   text: string;
//   sender: 'user' | 'gemini';
//   timestamp: Date;
// }

// export type MessagePart = {
//   inlineData: {
//     mimeType: string;
//     data: string;
//   };
// } | {
//   text: string;
// };

// export interface User {
//   id: string;
//   username: string;
//   // In a real app, password would not be stored on the client.
//   // For this mock, it helps simulate login.
//   password?: string;
//   role?: 'user' | 'owner'; // Added role property
// }

// export interface Conversation {
//   id: string;
//   title: string;
//   messages: ChatMessage[];
//   timestamp: Date;
// }

// Placeholder types commented out to avoid any potential syntax issues when running without a build step.
// In a real app, you would have a build process to transpile TypeScript.
