import React from 'react';
import { USER_AVATAR_URL, GEMINI_AVATAR_URL } from '../constants';

const ChatMessage = ({ message, isGoldMode = false }) => {
  const isUser = message.sender === 'user';
  const avatarUrl = isUser ? USER_AVATAR_URL : GEMINI_AVATAR_URL;
  
  let bubbleClasses = "";
  if (isUser) {
    bubbleClasses = 'bg-red-900 text-gray-100 rounded-br-none self-end border border-red-700 shadow-lg';
  } else if (isGoldMode) {
    bubbleClasses = 'bg-gradient-to-br from-amber-600 to-red-700 text-white rounded-bl-none self-start border-2 border-yellow-400 shadow-[0_0_15px_rgba(245,158,11,0.4)] font-medium';
  } else {
    bubbleClasses = 'bg-zinc-800 text-gray-200 rounded-bl-none self-start border border-zinc-700 shadow-md';
  }

  const containerClasses = isUser ? 'flex-row-reverse' : 'flex-row';

  return (
    React.createElement("div", { className: `flex items-start gap-3 p-4 ${containerClasses}` },
      React.createElement("div", { className: `relative ${!isUser && isGoldMode ? 'after:content-[""] after:absolute after:inset-0 after:rounded-full after:bg-yellow-400/20 after:animate-ping' : ''}` },
        React.createElement("img", {
          src: avatarUrl,
          alt: `${message.sender} avatar`,
          className: `w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 ${isGoldMode && !isUser ? 'border-yellow-400' : 'border-transparent'}`
        })
      ),
      React.createElement("div", { className: `max-w-[85%] md:max-w-[70%] p-4 rounded-2xl shadow-sm text-sm ${bubbleClasses}` },
        React.createElement("p", { className: `whitespace-pre-wrap leading-relaxed ${isGoldMode && !isUser ? 'drop-shadow-sm' : ''}` }, message.text),
        React.createElement("div", { className: "flex justify-between items-center mt-2 border-t border-white/10 pt-1" },
           React.createElement("span", { className: `text-[10px] ${isGoldMode && !isUser ? 'text-yellow-200 font-bold uppercase' : 'text-gray-400'}` }, 
             isGoldMode && !isUser ? "Zakariyya Geni-Ass" : message.sender
           ),
           React.createElement("span", { className: `text-[10px] ${isGoldMode && !isUser ? 'text-yellow-100' : 'text-gray-500'}` },
             message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
           )
        )
      )
    )
  );
};

export default ChatMessage;