import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { X, Send, Sparkles, Bot, User, Loader2 } from "lucide-react";
import { Streamdown } from "streamdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface WavvAIChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUGGESTED_QUESTIONS = [
  "How do I set up Call Boards?",
  "What is WAVV Wallet?",
  "How do I improve my connection rates?",
  "How do I add spam protection?",
  "How do I onboard my team?",
];

export default function WavvAIChat({ isOpen, onClose }: WavvAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const chatMutation = trpc.wavvAi.chat.useMutation();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: content.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await chatMutation.mutateAsync({
        messages: newMessages,
      });
      const aiContent = typeof response.content === 'string' ? response.content : String(response.content);
      setMessages([...newMessages, { role: "assistant", content: aiContent }]);
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "I'm having trouble connecting right now. Please try again or submit a support ticket.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 pointer-events-none">
      <div
        className="pointer-events-auto flex flex-col rounded-2xl overflow-hidden shadow-2xl"
        style={{
          width: "min(420px, calc(100vw - 2rem))",
          height: "min(600px, calc(100vh - 6rem))",
          background: "#141414",
          border: "1px solid #2a2a2a",
          boxShadow: "0 0 40px rgba(0, 116, 244, 0.15)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #0074F4 0%, #00A9E2 100%)",
          }}
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Ask WAVV</p>
            <p className="text-white/70 text-xs">Ask me anything about WAVV</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto text-white/70 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: "linear-gradient(135deg, #0074F4, #00A9E2)" }}
                >
                  <Bot size={14} className="text-white" />
                </div>
                <div
                  className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-gray-200"
                  style={{ background: "#1e1e1e", maxWidth: "85%" }}
                >
                  Hi! I'm Ask WAVV. I can help you with product questions, walk you through features, and point you to the right resources. What can I help you with?
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-gray-500 px-1">Suggested questions:</p>
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="w-full text-left text-xs px-3 py-2 rounded-lg transition-all"
                    style={{
                      background: "#1d2230",
                      border: "1px solid #2a2a2a",
                      color: "#9ca3af",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#0074F4";
                      e.currentTarget.style.color = "#60a5fa";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#252d3d";
                      e.currentTarget.style.color = "#9ca3af";
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{
                  background:
                    msg.role === "user"
                      ? "linear-gradient(135deg, #67C728, #00A9E2)"
                      : "linear-gradient(135deg, #0074F4, #00A9E2)",
                }}
              >
                {msg.role === "user" ? (
                  <User size={14} className="text-white" />
                ) : (
                  <Bot size={14} className="text-white" />
                )}
              </div>
              <div
                className="rounded-2xl px-4 py-3 text-sm"
                style={{
                  background: msg.role === "user" ? "rgba(0, 116, 244, 0.15)" : "#1e1e1e",
                  border: msg.role === "user" ? "1px solid rgba(0, 116, 244, 0.3)" : "1px solid #2a2a2a",
                  color: "#e5e7eb",
                  maxWidth: "85%",
                  borderRadius: msg.role === "user" ? "1rem 1rem 0.25rem 1rem" : "1rem 1rem 1rem 0.25rem",
                }}
              >
                {msg.role === "assistant" ? (
                  <Streamdown className="prose prose-invert prose-sm max-w-none text-gray-200">
                    {msg.content}
                  </Streamdown>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #0074F4, #00A9E2)" }}
              >
                <Bot size={14} className="text-white" />
              </div>
              <div
                className="rounded-2xl rounded-tl-sm px-4 py-3"
                style={{ background: "#1e1e1e", border: "1px solid #2a2a2a" }}
              >
                <Loader2 size={16} className="text-[#0074F4] animate-spin" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: "1px solid #2a2a2a" }}>
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2"
            style={{ background: "#1e1e1e", border: "1px solid #2a2a2a" }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about WAVV..."
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
              disabled={isLoading}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-40"
              style={{ background: "#0074F4" }}
            >
              <Send size={13} className="text-white" />
            </button>
          </div>
          <p className="text-xs text-gray-600 text-center mt-2">
            Ask WAVV · Powered by your knowledge base
          </p>
        </div>
      </div>
    </div>
  );
}
