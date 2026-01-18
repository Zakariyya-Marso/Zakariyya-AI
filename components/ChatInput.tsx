import React, { useState } from 'react';

const ChatInput = ({ onSendMessage, isLoading, isGoldMode = false }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  const activeBorder = isGoldMode ? 'border-yellow-500' : 'border-red-800';
  const activeFocus = isGoldMode ? 'focus:ring-yellow-500' : 'focus:ring-red-600';
  const buttonBg = isGoldMode ? 'bg-gradient-to-r from-amber-600 to-red-600' : 'bg-red-800';

  return (
    React.createElement("form", { onSubmit: handleSubmit, className: `p-4 bg-zinc-950 border-t ${activeBorder} flex items-center sticky bottom-0 z-10 gap-2` },
      React.createElement("textarea", {
        value: input,
        onChange: (e) => setInput(e.target.value),
        onKeyPress: handleKeyPress,
        className: `flex-1 resize-none p-4 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm h-14 max-h-32 overflow-y-auto bg-zinc-900 text-gray-100 placeholder-zinc-500 ${activeBorder} ${activeFocus}`,
        placeholder: isGoldMode ? "Ask the genius idiot..." : "Ask Zakariyya...",
        rows: 1,
        disabled: isLoading
      } as React.TextareaHTMLAttributes<HTMLTextAreaElement>),
      React.createElement("button", {
        type: "submit",
        className: `px-6 py-4 ${buttonBg} text-white rounded-xl hover:brightness-110 active:scale-95 transition-all focus:outline-none focus:ring-2 ${activeFocus} disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed text-xs font-black uppercase tracking-widest shadow-lg`,
        disabled: isLoading || !input.trim()
      }, isLoading ? "..." : "Send")
    )
  );
};

export default ChatInput;