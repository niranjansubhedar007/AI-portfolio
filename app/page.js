"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles, User, Bot, RotateCcw, ChevronDown, Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function App() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const chatRef = useRef(null);
  const isScrollingRef = useRef(false);
  const scrollTimerRef = useRef(null);
  const textareaRef = useRef(null);

  const suggestions = [
    { label: "⚡ Skills", query: "Tell me about skills and expertise" },
    { label: "💼 Experience", query: "Tell me about work experience" },
    { label: "🚀 Projects", query: "Tell me about projects" },
    { label: "🎓 Education", query: "Tell me about education" },
    { label: "📬 Contact", query: "Tell me about contact information" },
  ];

  const isAtBottom = () => {
    if (!chatRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = chatRef.current;
    return scrollHeight - scrollTop <= clientHeight + 60;
  };

  const scrollToBottom = (behavior = "smooth") => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior });
  };

  const handleScroll = () => {
    setShowScrollBtn(!isAtBottom());
    isScrollingRef.current = true;
    clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => {
      isScrollingRef.current = false;
    }, 150);
  };

  useEffect(() => {
    if (!isScrollingRef.current) scrollToBottom("smooth");
  }, [conversation, loading]);

  const sendMessage = async () => {
    if (!message.trim() || loading) return;
    isScrollingRef.current = false;

    const userMsg = { role: "user", content: message };
    setConversation((prev) => [...prev, userMsg]);
    setLoading(true);
    const sent = message;
    setMessage("");

    let result = "";
    for (let i = 0; i < 3; i++) {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: sent }),
      });
      const data = await res.json();
      if (!data.reply.includes("loading")) {
        result = data.reply;
        break;
      }
      await new Promise((r) => setTimeout(r, 3000));
    }

    setConversation((prev) => [
      ...prev,
      { role: "assistant", content: result || "Server busy 😅 please try again." },
    ]);
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setConversation([]);
    setMessage("");
    setShowScrollBtn(false);
    isScrollingRef.current = false;
  };

  const MsgContent = ({ content, role }) => {
    if (role === "user")
      return <p className="text-sm leading-relaxed whitespace-pre-wrap wrap-break-word text-white">{content}</p>;

    return (
      <div className="prose prose-sm max-w-none w-full prose-dark">
        <ReactMarkdown
          components={{
            strong: ({ children }) => <strong className="font-bold text-slate-100 wrap-break-word">{children}</strong>,
            em: ({ children }) => <em className="italic text-violet-300 wrap-break-word">{children}</em>,
            ul: ({ children }) => <ul className="list-disc pl-4 my-1 space-y-0.5">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal pl-4 my-1 space-y-0.5">{children}</ol>,
            li: ({ children }) => <li className="text-sm text-slate-300 wrap-break-word">{children}</li>,
            h1: ({ children }) => <h1 className="text-base font-bold mt-2 mb-1 text-slate-100">{children}</h1>,
            h2: ({ children }) => <h2 className="text-sm font-bold mt-1.5 mb-1 text-slate-100">{children}</h2>,
            h3: ({ children }) => <h3 className="text-sm font-semibold mt-1 mb-0.5 text-violet-300">{children}</h3>,
            p: ({ children }) => <p className="text-sm leading-relaxed mb-1 text-slate-300 wrap-break-word">{children}</p>,
            code: ({ children }) => (
              <code className="bg-violet-900/40 text-cyan-300 px-1.5 py-0.5 rounded text-xs font-mono break-all border border-violet-700/30">
                {children}
              </code>
            ),
            a: ({ href, children }) => (
              <a href={href} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline break-all transition-colors">
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
    <div className="h-screen bg-mesh flex flex-col overflow-hidden">

      {/* Decorative orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-violet-700/6 blur-2xl" />
      </div>

      {/* Header */}
      <header className="glass sticky top-0 z-20 shrink-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg glow-purple animate-pulse-ring">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold glow-text-purple leading-tight">
                Niranjan&apos;s AI Assistant
              </h1>
              <p className="text-[10px] text-slate-500 leading-none mt-0.5 hidden sm:block">
                Portfolio · Skills · Projects · Contact
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </span>
            {conversation.length > 0 && (
              <button
                onClick={clearChat}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-2 text-slate-400 hover:text-violet-300 text-xs transition-all duration-200"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">New Chat</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 sm:px-6 overflow-hidden">

        {/* Quick questions */}
        <div className="shrink-0 pt-4 pb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-violet-400" /> Quick Ask
            </span>
            {conversation.length > 0 && (
              <button onClick={clearChat} className="text-[10px] text-violet-400 hover:text-violet-300 font-medium transition-colors">
                Clear chat
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s.label}
                onClick={() => { setMessage(s.query); textareaRef.current?.focus(); }}
                disabled={loading}
                className="tag-pill px-3 py-1.5 rounded-full text-xs font-medium touch-manipulation"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div
          ref={chatRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto"
          style={{ scrollbarWidth: "thin", WebkitOverflowScrolling: "touch" }}
        >
          {/* Welcome */}
          {conversation.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center animate-fade-up px-4">
              <div className="relative mb-4">
                <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-2xl glow-purple">
                  <Bot className="w-10 h-10 text-white" />
                </div>
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-[#07071a] flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Hey there! 👋</h2>
              <p className="glow-text-purple text-lg font-semibold mb-3">I&apos;m Niranjan&apos;s AI Assistant</p>
              <p className="text-slate-400 text-sm max-w-sm leading-relaxed mb-6">
                Ask me anything about Niranjan — his skills, projects, experience, or how to get in touch.
              </p>
          
            </div>
          )}

          {/* Messages */}
          {conversation.length > 0 && (
            <div className="space-y-4 pb-2">
              {conversation.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-end gap-2.5 ${
                    msg.role === "user" ? "justify-end animate-slide-l" : "justify-start animate-slide-r"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="shrink-0 mb-0.5">
                      <div className="w-7 h-7 rounded-xl bg-linear-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-md glow-purple">
                        <Bot className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                  )}
                  <div className={`max-w-[82%] sm:max-w-[72%] px-4 py-2.5 overflow-hidden ${
                    msg.role === "user" ? "bubble-user" : "bubble-bot"
                  }`}>
                    <MsgContent content={msg.content} role={msg.role} />
                  </div>
                  {msg.role === "user" && (
                    <div className="shrink-0 mb-0.5">
                      <div className="w-7 h-7 rounded-xl bg-linear-to-br from-slate-600 to-slate-500 flex items-center justify-center shadow-md">
                        <User className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div className="flex items-end gap-2.5 justify-start animate-slide-r">
                  <div className="w-7 h-7 rounded-xl bg-linear-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-md shrink-0">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bubble-bot px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Scroll button */}
        {showScrollBtn && (
          <div className="sticky bottom-24 flex justify-center z-10 pointer-events-none mb-1">
            <button
              onClick={() => scrollToBottom("smooth")}
              className="pointer-events-auto glass-2 rounded-full p-2 shadow-lg animate-bounce-soft border border-violet-500/20 hover:border-violet-500/50 transition-colors"
            >
              <ChevronDown className="w-4 h-4 text-violet-400" />
            </button>
          </div>
        )}

        {/* Input bar */}
        <div className="sticky bottom-0 pt-2 pb-4 shrink-0">
          <div className="glass-2 rounded-2xl shadow-2xl border border-violet-500/10 p-1.5 transition-all duration-200 focus-within:border-violet-500/40 focus-within:shadow-[0_0_30px_rgba(139,92,246,0.2)]">
            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                placeholder="Ask me about Niranjan…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKey}
                rows={1}
                className="flex-1 px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none resize-none rounded-xl bg-transparent"
                style={{ maxHeight: "100px", fontSize: "16px" }}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !message.trim()}
                className="btn-gradient px-4 py-2.5 rounded-xl mb-0.5 flex items-center gap-2 text-white text-sm font-semibold shadow-lg min-w-[2.8rem]"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Send</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <p className="text-center text-[10px] text-slate-600 mt-1.5">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </main>
    </div>
  );
}
