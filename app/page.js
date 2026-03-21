"use client";
import { useState } from "react";
import { Send, Loader2, Sparkles, User, Bot, ArrowLeft, Home } from "lucide-react";
import ReactMarkdown from 'react-markdown';

export default function App() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const suggestions = [
    { label: "Skills & Expertise", query: "Tell me about skills and expertise" },
    { label: "Work Experience", query: "Tell me about work experience" },
    { label: "Projects", query: "Tell me about projects" },
    { label: "Education", query: "Tell me about education" },
    { label: "Contact Info", query: "Tell me about contact information" }
  ];

  const sendMessage = async () => {
    if (!message.trim()) return;

    // Add user message to conversation
    const userMessage = { role: "user", content: message };
    setConversation(prev => [...prev, userMessage]);
    setLoading(true);
    setReply("");

    let attempts = 0;
    let result = "";

    while (attempts < 3) {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      if (!data.reply.includes("loading")) {
        result = data.reply;
        break;
      }

      attempts++;
      await new Promise((r) => setTimeout(r, 3000));
    }

    const finalReply = result || "Server busy 😅 try again";
    setReply(finalReply);
    
    // Add AI response to conversation
    setConversation(prev => [...prev, { role: "assistant", content: finalReply }]);
    setLoading(false);
    setMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (query) => {
    setMessage(query);
    // Don't automatically send - just set the message in input
  };

  const clearConversation = () => {
    setConversation([]);
    setReply("");
    setMessage("");
    setShowSuggestions(true);
  };

  // Custom component to render formatted text
  const MessageContent = ({ content, role }) => {
    if (role === "user") {
      return <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>;
    }
    
    return (
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown
          components={{
            // Style for bold text
            strong: ({ children }) => (
              <strong className="font-bold text-gray-900">{children}</strong>
            ),
            // Style for italic text
            em: ({ children }) => (
              <em className="italic text-gray-700">{children}</em>
            ),
            // Style for lists
            ul: ({ children }) => (
              <ul className="list-disc pl-4 my-2 space-y-1">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-4 my-2 space-y-1">{children}</ol>
            ),
            li: ({ children }) => (
              <li className="text-sm text-gray-700">{children}</li>
            ),
            // Style for headings
            h1: ({ children }) => (
              <h1 className="text-xl font-bold mt-4 mb-2 text-gray-900">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-lg font-bold mt-3 mb-2 text-gray-900">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-md font-bold mt-2 mb-1 text-gray-900">{children}</h3>
            ),
            // Style for paragraphs
            p: ({ children }) => (
              <p className="text-sm leading-relaxed mb-2">{children}</p>
            ),
            // Style for code
            code: ({ children }) => (
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">
                {children}
              </code>
            ),
            // Style for links
            a: ({ href, children }) => (
              <a href={href} target="_blank" rel="noopener noreferrer" 
                 className="text-blue-600 hover:text-blue-700 underline">
                {children}
              </a>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                AI Portfolio Assistant
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              {conversation.length > 0 && (
                <button
                  onClick={clearConversation}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">New Chat</span>
                </button>
              )}
              <div className="text-sm text-gray-500">
                Ask me about Niranjan
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Message */}
        <div className={`text-center mb-12 animate-fadeIn ${conversation.length > 0 ? 'mb-8' : ''}`}>
          <div className={`inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 mb-6 shadow-lg ${conversation.length > 0 ? 'w-16 h-16' : 'w-20 h-20'}`}>
            <Bot className={`text-white ${conversation.length > 0 ? 'w-8 h-8' : 'w-10 h-10'}`} />
          </div>
          <h2 className={`font-bold text-gray-900 mb-4 ${conversation.length > 0 ? 'text-2xl' : 'text-3xl'}`}>
            Hello! I'm your AI Assistant
          </h2>
          <p className={`text-gray-600 mb-6 ${conversation.length > 0 ? 'text-base' : 'text-lg'}`}>
            Ask me anything about Niranjan's skills, experience, projects, background and other details.
          </p>
        </div>

        {/* Question Tags - Always Visible */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Quick Questions
            </h3>
            {conversation.length > 0 && (
              <button
                onClick={clearConversation}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.label}
                onClick={() => handleSuggestionClick(suggestion.query)}
                disabled={loading}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 shadow-sm ${
                  loading
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-200 hover:shadow-md hover:scale-105 active:scale-95"
                }`}
              >
                {suggestion.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation Messages */}
        {conversation.length > 0 && (
          <div className="space-y-6 mb-8">
            {conversation.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start space-x-3 animate-slideIn ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
                <div
                  className={`max-w-[70%] rounded-2xl px-5 py-3 ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                      : "bg-white text-gray-800 shadow-md border border-gray-100"
                  }`}
                >
                  <MessageContent content={msg.content} role={msg.role} />
                </div>
                {msg.role === "user" && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center shadow-md">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-start space-x-3 animate-pulse">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="bg-white rounded-2xl px-5 py-3 shadow-md border border-gray-100">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <p className="text-sm text-gray-600">Thinking...</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Input Area */}
        <div className="sticky bottom-0 bg-gradient-to-t from-slate-50/95 via-slate-50/95 to-transparent pt-6 pb-4">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-2">
            <div className="flex items-end space-x-2">
              <textarea
                placeholder="Ask me anything about Niranjan..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                rows={1}
                className="flex-1 px-4 py-3 text-gray-700 placeholder-gray-400 focus:outline-none resize-none rounded-xl"
                style={{ maxHeight: "120px" }}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !message.trim()}
                className={`px-5 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                  loading || !message.trim()
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:scale-105 active:scale-95"
                }`}
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
            <div className="text-xs text-gray-400 text-center mt-2 flex items-center justify-center space-x-4">
              <span>Press Enter to send</span>
              <span>•</span>
              <span>Click question tags to fill the input</span>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        textarea {
          scrollbar-width: thin;
        }
      `}</style>
    </div>
  );
}