import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ChatMessageComponent from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import LoadingSpinner from './components/LoadingSpinner';
import AuthScreen from './components/AuthScreen';
import HistorySidebar from './components/HistorySidebar';
import { geminiService } from './services/geminiService';
import {
  APP_NAME,
  LOCAL_STORAGE_USER_KEY,
  LOCAL_STORAGE_HISTORY_KEY,
  LOCAL_STORAGE_MOCK_USERS_KEY,
  OWNER_SYSTEM_INSTRUCTION,
  DEFAULT_SYSTEM_INSTRUCTION
} from './constants';
import { generateUUID } from './utils/uuid';

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedInstruction, setSelectedInstruction] = useState(DEFAULT_SYSTEM_INSTRUCTION);

  const messagesEndRef = useRef(null);
  const chatHistoryRef = useRef(chatHistory);

  useEffect(() => {
    chatHistoryRef.current = chatHistory;
  }, [chatHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const isGoldMode = useMemo(() => {
    return selectedInstruction === OWNER_SYSTEM_INSTRUCTION || (currentUser?.role === 'owner');
  }, [selectedInstruction, currentUser]);

  const getMockUsers = useCallback(() => {
    const usersJson = localStorage.getItem(LOCAL_STORAGE_MOCK_USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  }, []);

  const saveMockUsers = useCallback((users) => {
    localStorage.setItem(LOCAL_STORAGE_MOCK_USERS_KEY, JSON.stringify(users));
  }, []);

  useEffect(() => {
    const mockUsers = getMockUsers();
    if (mockUsers.length === 0) {
      const zakiUser = { id: generateUUID(), username: 'zaki', password: '6879', role: 'owner' };
      saveMockUsers([zakiUser]);
    }
  }, [getMockUsers, saveMockUsers]);

  useEffect(() => {
    const storedUser = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      const instruction = user.role === 'owner' ? OWNER_SYSTEM_INSTRUCTION : DEFAULT_SYSTEM_INSTRUCTION;
      setSelectedInstruction(instruction);
      geminiService.startNewChatSession(instruction);
    }

    const storedHistory = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
    if (storedHistory) {
      const parsedHistory = JSON.parse(storedHistory).map((conv) => ({
        ...conv,
        timestamp: new Date(conv.timestamp),
        messages: conv.messages.map(msg => ({ ...msg, timestamp: new Date(msg.timestamp) }))
      }));
      setChatHistory(parsedHistory);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleLogin = useCallback((usernameAttempt, passwordAttempt) => {
    const mockUsers = getMockUsers();
    const user = mockUsers.find(
      (u) => u.username === usernameAttempt && u.password === passwordAttempt
    );
    if (user) {
      setCurrentUser(user);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
      const instruction = user.role === 'owner' ? OWNER_SYSTEM_INSTRUCTION : DEFAULT_SYSTEM_INSTRUCTION;
      setSelectedInstruction(instruction);
      geminiService.startNewChatSession(instruction);
      return null;
    }
    return 'Invalid username or password.';
  }, [getMockUsers]);

  const handleSignup = useCallback((usernameAttempt, passwordAttempt) => {
    let mockUsers = getMockUsers();
    if (mockUsers.some((u) => u.username === usernameAttempt)) {
      return 'Username already taken.';
    }
    const newUser = { id: generateUUID(), username: usernameAttempt, password: passwordAttempt, role: 'user' };
    mockUsers = [...mockUsers, newUser];
    saveMockUsers(mockUsers);
    setCurrentUser(newUser);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(newUser));
    setSelectedInstruction(DEFAULT_SYSTEM_INSTRUCTION);
    geminiService.startNewChatSession(DEFAULT_SYSTEM_INSTRUCTION);
    return null;
  }, [getMockUsers, saveMockUsers]);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setMessages([]);
    setChatHistory([]);
    setCurrentConversationId(null);
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    localStorage.removeItem(LOCAL_STORAGE_HISTORY_KEY);
    geminiService.startNewChatSession(DEFAULT_SYSTEM_INSTRUCTION);
  }, []);

  const saveCurrentConversation = useCallback((newMessages, convId) => {
    if (!currentUser || newMessages.length === 0) return;

    const conversationToSave = {
      id: convId || currentConversationId || generateUUID(),
      title: newMessages[0].text.substring(0, 50) + (newMessages[0].text.length > 50 ? '...' : ''),
      messages: newMessages,
      timestamp: new Date(),
    };

    setChatHistory((prevHistory) => {
      const existingIndex = prevHistory.findIndex((conv) => conv.id === conversationToSave.id);
      if (existingIndex > -1) {
        const updatedHistory = [...prevHistory];
        updatedHistory[existingIndex] = conversationToSave;
        return updatedHistory;
      } else {
        return [...prevHistory, conversationToSave];
      }
    });
    setCurrentConversationId(conversationToSave.id);
  }, [currentUser, currentConversationId]);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setCurrentConversationId(generateUUID());
    setIsSidebarOpen(false);
    geminiService.startNewChatSession(selectedInstruction);
  }, [selectedInstruction]);

  const handleSelectConversation = useCallback((convId) => {
    const conversation = chatHistory.find((conv) => conv.id === convId);
    if (conversation) {
      setMessages(conversation.messages);
      setCurrentConversationId(convId);
      geminiService.startNewChatSession(selectedInstruction);
    }
    setIsSidebarOpen(false);
  }, [chatHistory, selectedInstruction]);

  const handleSendMessage = useCallback(async (text) => {
    const newUserMessage = {
      id: generateUUID(),
      text: text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setIsLoading(true);

    let geminiResponseText = '';
    const geminiMessageId = generateUUID();

    try {
      const stream = await geminiService.sendMessageToGemini(text, selectedInstruction);

      for await (const chunk of stream) {
        const c = chunk;
        if (c.text) {
          geminiResponseText += c.text;
          setMessages((prevMessages) => {
            const existingGeminiMessageIndex = prevMessages.findIndex(
              (msg) => msg.id === geminiMessageId
            );
            if (existingGeminiMessageIndex > -1) {
              const messagesAfterUpdate = [...prevMessages];
              messagesAfterUpdate[existingGeminiMessageIndex] = {
                ...messagesAfterUpdate[existingGeminiMessageIndex],
                text: geminiResponseText,
              };
              saveCurrentConversation(messagesAfterUpdate, currentConversationId);
              return messagesAfterUpdate;
            } else {
              const newGeminiMessage = {
                id: geminiMessageId,
                text: geminiResponseText,
                sender: 'gemini',
                timestamp: new Date(),
              };
              const messagesAfterAdd = [...prevMessages, newGeminiMessage];
              saveCurrentConversation(messagesAfterAdd, currentConversationId);
              return messagesAfterAdd;
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to get response from Gemini:', error);
      setMessages((prevMessages) => {
        const errorMsg = {
          id: generateUUID(),
          text: 'Oops! Something went wrong.',
          sender: 'gemini',
          timestamp: new Date(),
        };
        return [...prevMessages, errorMsg];
      });
    } finally {
      setIsLoading(false);
    }
  }, [saveCurrentConversation, currentConversationId, selectedInstruction]);

  const onInstructionChange = (instruction) => {
    setSelectedInstruction(instruction);
    geminiService.startNewChatSession(instruction);
  };

  if (!currentUser) {
    return React.createElement(AuthScreen, { onLogin: handleLogin, onSignup: handleSignup });
  }

  const headerBg = isGoldMode ? "bg-gradient-to-r from-amber-600 via-yellow-500 to-red-600" : "bg-red-900";
  const mainBg = isGoldMode ? "bg-zinc-950" : "bg-zinc-900";

  return (
    React.createElement("div", { className: "flex h-screen bg-zinc-950 overflow-hidden text-gray-100" },
      React.createElement(HistorySidebar, {
        conversations: chatHistoryRef.current,
        onSelectConversation: handleSelectConversation,
        onNewChat: handleNewChat,
        activeConversationId: currentConversationId,
        isOpen: isSidebarOpen,
        onClose: () => setIsSidebarOpen(false),
        currentUser: currentUser,
        onLogout: handleLogout,
        selectedInstruction: selectedInstruction,
        onInstructionChange: onInstructionChange,
        isGoldMode: isGoldMode
      }),

      isSidebarOpen && (
        React.createElement("div", {
          className: "fixed inset-0 bg-black bg-opacity-70 z-10 md:hidden",
          onClick: () => setIsSidebarOpen(false),
          role: "button",
          "aria-label": "Close sidebar",
        })
      ),

      React.createElement("div", { className: "flex flex-col flex-1 relative z-0" },
        React.createElement("header", { className: `p-4 text-white shadow-2xl text-xl font-black sticky top-0 z-10 flex items-center justify-between border-b ${isGoldMode ? 'border-yellow-400' : 'border-red-700'} ${headerBg}` },
          React.createElement("button", {
            onClick: () => setIsSidebarOpen(!isSidebarOpen),
            className: `text-white p-2 rounded-md hover:brightness-110 focus:outline-none focus:ring-2 ${isGoldMode ? 'focus:ring-yellow-400' : 'focus:ring-red-500'} md:mr-4`,
            "aria-label": isSidebarOpen ? 'Close history sidebar' : 'Open history sidebar',
          },
            React.createElement("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg" },
              React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "3", d: "M4 6h16M4 12h16M4 18h16" })
            )
          ),
          React.createElement("h1", { className: `text-center flex-1 drop-shadow-md tracking-tighter uppercase ${isGoldMode ? 'text-zinc-900' : 'text-white'}` }, APP_NAME)
        ),

        React.createElement("main", { className: `flex-1 overflow-y-auto p-4 flex flex-col space-y-4 max-w-full md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto w-full text-gray-100 ${mainBg}` },
          messages.length === 0 ? (
            React.createElement("div", { className: "flex-1 flex flex-col items-center justify-center text-gray-400 text-lg" },
              React.createElement("div", { className: `mb-6 p-1 rounded-full ${isGoldMode ? 'bg-gradient-to-tr from-amber-500 to-red-500 animate-pulse' : ''}` },
                React.createElement("img", { src: "/placeholder.svg", className: "w-24 h-24 rounded-full bg-zinc-800 p-1", alt: "Logo" })
              ),
              React.createElement("p", { className: "font-bold" }, "WAKE UP, ", currentUser.username, "!"),
              React.createElement("p", { className: "text-sm mt-2 text-red-400 font-mono text-center max-w-xs" }, 
                isGoldMode ? "YOU'VE ENABLED THE REAL ZAKARIYYA. DON'T CRY IF I HURT YOUR FEELINGS." : "The polite version is active. Borrrrring."
              )
            )
          ) : (
            messages.map((message) => (
              React.createElement(ChatMessageComponent, { 
                key: message.id, 
                message: message, 
                isGoldMode: isGoldMode && message.sender === 'gemini' 
              })
            ))
          ),
          isLoading && React.createElement(LoadingSpinner, null),
          React.createElement("div", { ref: messagesEndRef })
        ),

        React.createElement(ChatInput, { onSendMessage: handleSendMessage, isLoading: isLoading, isGoldMode: isGoldMode })
      )
    )
  );
};

export default App;