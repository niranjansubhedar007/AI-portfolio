"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles, User, Bot, Home, ChevronDown } from "lucide-react";
import ReactMarkdown from 'react-markdown';

export default function App() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  // Refs for scroll management
  const chatContainerRef = useRef(null);
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);

  const suggestions = [
    { label: "Skills & Expertise", query: "Tell me about skills and expertise" },
    { label: "Work Experience", query: "Tell me about work experience" },
    { label: "Projects", query: "Tell me about projects" },
    { label: "Education", query: "Tell me about education" },
    { label: "Contact Info", query: "Tell me about contact information" }
  ];

  // Check if user is at bottom
  const isAtBottom = () => {
    if (!chatContainerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    return scrollHeight - scrollTop <= clientHeight + 50;
  };

  // Scroll to bottom
  const scrollToBottom = (behavior = "smooth") => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: behavior
      });
    }
  };

  // Handle scroll events
  const handleScroll = () => {
    const atBottom = isAtBottom();
    setShowScrollButton(!atBottom);
    
    isUserScrollingRef.current = true;
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      isUserScrollingRef.current = false;
    }, 150);
  };

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (!isUserScrollingRef.current) {
      scrollToBottom("smooth");
    }
  }, [conversation, loading]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    isUserScrollingRef.current = false;
    
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
    document.querySelector('textarea')?.focus();
  };

  const clearConversation = () => {
    setConversation([]);
    setReply("");
    setMessage("");
    setShowScrollButton(false);
    isUserScrollingRef.current = false;
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
            strong: ({ children }) => (
              <strong className="font-bold text-gray-900">{children}</strong>
            ),
            em: ({ children }) => (
              <em className="italic text-gray-700">{children}</em>
            ),
            ul: ({ children }) => (
              <ul className="list-disc pl-4 my-1 space-y-0.5">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-4 my-1 space-y-0.5">{children}</ol>
            ),
            li: ({ children }) => (
              <li className="text-sm text-gray-700">{children}</li>
            ),
            h1: ({ children }) => (
              <h1 className="text-lg font-bold mt-2 mb-1 text-gray-900">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-md font-bold mt-1.5 mb-1 text-gray-900">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-sm font-bold mt-1 mb-0.5 text-gray-900">{children}</h3>
            ),
            p: ({ children }) => (
              <p className="text-sm leading-relaxed mb-1">{children}</p>
            ),
            code: ({ children }) => (
              <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">
                {children}
              </code>
            ),
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
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col overflow-hidden">
      {/* Header - Compact */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-20 flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 py-2.5 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-1.5 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="lg:text-xl md:text-lg text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                AI Portfolio Assistant
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              {conversation.length > 0 && (
                <button
                  onClick={clearConversation}
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">New Chat</span>
                </button>
              )}
              <div className="md:text-xs text-[11px] text-gray-500">
                Ask me about Niranjan
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Perfect Scroll Area */}
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 sm:px-6 overflow-hidden">
        {/* Scrollable Chat Container */}
        <div 
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto scroll-smooth py-4"
          style={{ 
            scrollBehavior: "smooth",
            msOverflowStyle: "none",
            scrollbarWidth: "thin"
          }}
        >
          {/* Welcome Message - Compact */}
          {conversation.length === 0 && (
            <div className="text-center animate-fadeIn py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 mb-3 shadow-lg">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Hello! I'm your AI Assistant
              </h2>
              <p className="text-gray-600 mb-4 text-sm max-w-md mx-auto">
                Ask me anything about Niranjan's skills, experience, projects, background and other details.
              </p>
            </div>
          )}

          {/* Question Tags - Always Visible */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Quick Questions
              </h3>
              {conversation.length > 0 && (
                <button
                  onClick={clearConversation}
                  className="text-[11px] text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.label}
                  onClick={() => handleSuggestionClick(suggestion.query)}
                  disabled={loading}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 shadow-sm ${
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
            <div className="space-y-4">
              {conversation.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-start space-x-2.5 animate-slideIn ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
                        <Bot className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
                        : "bg-white text-gray-800 shadow-sm border border-gray-100"
                    }`}
                  >
                    <MessageContent content={msg.content} role={msg.role} />
                  </div>
                  {msg.role === "user" && (
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center shadow-sm">
                        <User className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex items-start space-x-2.5 animate-pulse">
                  <div className="flex-shrink-0">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl px-4 py-2 shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                      <p className="text-xs text-gray-600">Thinking...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Scroll to Bottom Button */}
        {showScrollButton && (
          <div className="sticky bottom-20 flex justify-center z-10 pointer-events-none">
            <button
              onClick={() => scrollToBottom("smooth")}
              className="pointer-events-auto bg-white shadow-lg hover:shadow-xl rounded-full p-1.5 transition-all duration-200 animate-bounce-slow border border-gray-200"
            >
              <ChevronDown className="w-4 h-4 text-blue-600" />
            </button>
          </div>
        )}

        {/* Input Area - Compact */}
        <div className="sticky bottom-0 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pt-2 pb-3 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-1.5">
            <div className="flex items-end space-x-1.5">
              <textarea
                placeholder="Ask me anything about Niranjan..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                rows={1}
                className="flex-1 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none resize-none rounded-lg"
                style={{ maxHeight: "100px" }}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !message.trim()}
                className={`px-3.5 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-1.5 ${
                  loading || !message.trim()
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-md hover:scale-105 active:scale-95"
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-sm">Send</span>
              </button>
            </div>
            <div className="text-[10px] text-gray-400 text-center mt-1.5 flex items-center justify-center space-x-3">
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
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
        
        .animate-slideIn {
          animation: slideIn 0.25s ease-out;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 1.5s infinite;
        }
        
        /* Custom scrollbar - Thinner */
        ::-webkit-scrollbar {
          width: 4px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
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
        
        /* Remove default focus outline */
        textarea:focus, button:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
}