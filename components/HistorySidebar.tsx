import React, { useState } from 'react';
import { DEFAULT_SYSTEM_INSTRUCTION, OWNER_SYSTEM_INSTRUCTION } from '../constants';

const HistorySidebar = ({
  conversations,
  onSelectConversation,
  onNewChat,
  activeConversationId,
  isOpen,
  onClose,
  currentUser,
  onLogout,
  selectedInstruction,
  onInstructionChange,
  isGoldMode = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.messages.some(msg => msg.text.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const themeBorder = isGoldMode ? "border-yellow-600" : "border-red-900";
  const themeTextHighlight = isGoldMode ? "text-yellow-500" : "text-red-500";
  const themeActiveItem = isGoldMode ? "bg-amber-900/40 border-l-4 border-yellow-500" : "bg-red-900/40 border-l-4 border-red-500";

  return (
    React.createElement("div", {
      className: `
        h-full bg-zinc-950 border-r ${themeBorder} text-gray-100
        flex-col z-20 fixed top-0 left-0 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        w-64 md:w-80 md:relative md:transform-none
        ${isOpen ? 'md:flex' : 'md:hidden'}
      `
    },
      React.createElement("div", { className: `flex items-center justify-between p-4 border-b ${themeBorder} bg-zinc-900` },
        React.createElement("h3", { className: `text-xl font-black uppercase tracking-tighter ${themeTextHighlight}` }, "Archives"),
        React.createElement("button", {
          onClick: onClose,
          className: "text-gray-400 hover:text-white md:hidden",
        },
          React.createElement("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
            React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M6 18L18 6M6 6l12 12" })
          )
        )
      ),
      
      React.createElement("div", { className: `p-4 space-y-3 border-b ${themeBorder} bg-zinc-900` },
        React.createElement("button", {
          onClick: onNewChat,
          className: `w-full ${isGoldMode ? 'bg-gradient-to-r from-amber-600 to-red-600' : 'bg-red-800'} text-white py-3 px-4 rounded-xl hover:brightness-110 transition-all text-xs font-black uppercase tracking-widest shadow-lg`
        }, "+ Initiate Session"),
        
        React.createElement("div", { className: "space-y-1" },
          React.createElement("label", { className: `text-[10px] uppercase font-bold ${isGoldMode ? 'text-yellow-600' : 'text-zinc-500'} ml-1` }, "Logic Engine"),
          React.createElement("select", {
            value: selectedInstruction,
            onChange: (e) => onInstructionChange(e.target.value),
            className: `w-full px-3 py-2 bg-zinc-800 border ${themeBorder} rounded-xl text-[11px] font-bold focus:ring-1 focus:ring-yellow-500 focus:outline-none appearance-none cursor-pointer`
          },
            React.createElement("option", { value: DEFAULT_SYSTEM_INSTRUCTION }, "Helpful (Standard)"),
            React.createElement("option", { value: OWNER_SYSTEM_INSTRUCTION }, "Aggressive (Zakariyya)")
          )
        )
      ),

      React.createElement("div", { className: `p-4 border-b ${themeBorder} bg-zinc-950` },
        React.createElement("input", {
          type: "text",
          placeholder: "Scan memories...",
          value: searchTerm,
          onChange: (e) => setSearchTerm(e.target.value),
          className: `w-full px-4 py-2 border ${themeBorder} rounded-xl focus:ring-1 focus:ring-yellow-500 text-xs bg-zinc-900 text-gray-100 placeholder-zinc-600`
        })
      ),
      
      React.createElement("div", { className: "flex-1 overflow-y-auto bg-zinc-950" },
        filteredConversations.length === 0 ? (
          React.createElement("div", { className: "flex flex-col items-center justify-center h-40 text-zinc-700 italic text-xs" },
            React.createElement("p", null, "No logs recorded.")
          )
        ) : (
          React.createElement("ul", null,
            filteredConversations.map((conv) => (
              React.createElement("li", {
                key: conv.id,
                onClick: () => {
                  onSelectConversation(conv.id);
                  onClose();
                },
                className: `p-4 cursor-pointer border-b border-zinc-900/50 hover:bg-zinc-900 transition-all
                  ${activeConversationId === conv.id ? themeActiveItem : 'bg-transparent'}`,
              },
                React.createElement("h4", { className: `text-xs font-bold truncate ${activeConversationId === conv.id && isGoldMode ? 'text-yellow-400' : 'text-zinc-300'}` }, conv.title),
                React.createElement("div", { className: "flex justify-between items-center mt-2" },
                   React.createElement("span", { className: "text-[9px] text-zinc-600" }, conv.timestamp.toLocaleDateString()),
                   React.createElement("span", { className: `text-[9px] uppercase font-bold ${isGoldMode ? 'text-amber-800' : 'text-red-900'}` }, "Verified")
                )
              )
            ))
          )
        )
      ),
      
      currentUser && (
        React.createElement("div", { className: `p-4 border-t ${themeBorder} bg-zinc-900 sticky bottom-0` },
          React.createElement("p", { className: "text-[10px] uppercase font-black text-zinc-600 mb-1" }, "Authorized Personnel"),
          React.createElement("div", { className: "flex items-center gap-3" },
            React.createElement("div", { className: `w-8 h-8 rounded-full border ${isGoldMode ? 'border-yellow-500' : 'border-red-700'} overflow-hidden` },
               React.createElement("img", { src: `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username}`, alt: "User" })
            ),
            React.createElement("div", { className: "flex-1 min-w-0" },
              React.createElement("p", { className: `text-sm font-black truncate ${isGoldMode ? 'text-yellow-500' : 'text-red-500'}` }, currentUser.username),
              currentUser.role === 'owner' && React.createElement("span", { className: `text-[9px] font-black uppercase tracking-widest ${isGoldMode ? 'text-amber-400' : 'text-purple-400'}` }, "God Level")
            )
          ),
          React.createElement("button", {
            onClick: onLogout,
            className: `mt-4 w-full px-3 py-2 ${isGoldMode ? 'bg-zinc-800 border border-yellow-600 hover:bg-red-950 hover:text-white' : 'bg-zinc-800 border border-red-900 hover:bg-red-900'} text-zinc-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all`,
          }, "Terminate Connection")
        )
      )
    )
  );
};

export default HistorySidebar;