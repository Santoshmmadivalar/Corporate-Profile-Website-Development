'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Sparkles, Send, X, Bot, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendAIChat } from '../../services/api';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

export const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 'welcome',
      sender: 'ai', 
      text: 'Hi! I am Outpro.India\'s digital assistant. Ask me anything about our software engineering services, open job positions, or billing processes.\n\nHere are some things I can do:\n- Detail our **engineering stacks**\n- Explain how **billing workflows** operate\n- Help you review **career opportunities**' 
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getLocalReply = (message: string) => {
    const query = message.toLowerCase();
    const localFAQs = [
      {
        keywords: ['service', 'offer', 'do you do', 'capabilities'],
        answer: 'Outpro.India offers premium corporate digital services, including:\n- **Custom Software Engineering** (React, Next.js, Node.js)\n- **Cloud Architectures & DevOps** (AWS, Docker, CI/CD)\n- **Enterprise Headless CMS** integrations\n- **AI/RAG Platform** consultation and design builds.'
      },
      {
        keywords: ['hire', 'career', 'job', 'work', 'position', 'positions', 'apply'],
        answer: 'We are currently hiring for multiple engineering roles!\n- **Senior Frontend Engineers** (React/Next.js)\n- **DevOps Architects**\n- **Project Managers**\n\nYou can review roles and scan your resume ATS compatibility on our `/careers` section.'
      },
      {
        keywords: ['billing', 'invoice', 'pay', 'cost', 'pricing', 'rate', 'rates'],
        answer: 'Our client billing operates securely through the **Client Portal**:\n- Track active milestones and sprint hours\n- Pay invoices online via credit card/bank transfer\n- View full history of past ledger payouts'
      },
      {
        keywords: ['meeting', 'schedule', 'book', 'call', 'consultation', 'talk'],
        answer: 'You can easily schedule a consultation slot with our directors or project managers using the **Meetings** dashboard at `/meetings`. Select a time and link your agenda!'
      },
      {
        keywords: ['contact', 'support', 'help', 'ticket', 'email', 'phone', 'address'],
        answer: 'You can contact our support desk or open helpdesk tickets from the Client Portal. Our team can also be reached directly via our Contact page or at support@outpro.india.'
      }
    ];

    for (const faq of localFAQs) {
      const match = faq.keywords.some(kw => query.includes(kw));
      if (match) return faq.answer;
    }
    return `Thank you for reaching out! The live AI assistant is temporarily offline, but I can help you with company details.\n\nFeel free to ask about our **services**, **billing**, **careers**, **contact** details, or **scheduling a meeting**!`;
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    
    const userMsgId = `user-${Date.now()}`;
    setMessages(prev => [...prev, { id: userMsgId, sender: 'user', text: textToSend }]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await sendAIChat(textToSend);
      const aiMsgId = `ai-${Date.now()}`;
      if (response.success && response.data) {
        setMessages(prev => [...prev, { id: aiMsgId, sender: 'ai', text: response.data.reply }]);
      } else {
        const localReply = getLocalReply(textToSend);
        setMessages(prev => [...prev, { id: aiMsgId, sender: 'ai', text: localReply }]);
      }
    } catch (error) {
      console.warn('Axios API connection failed, executing client-side fallback matching.');
      const aiMsgId = `ai-${Date.now()}`;
      const localReply = getLocalReply(textToSend);
      setMessages(prev => [...prev, { id: aiMsgId, sender: 'ai', text: localReply }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handlePresetClick = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const presets = [
    'What services do you offer?',
    'Are you hiring engineers?',
    'How does billing work?'
  ];

  const formatMarkdown = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line) => {
      let processed = line;
      // Bold Markdown **text**
      processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-primary">$1</strong>');
      // Inline Code `code`
      processed = processed.replace(/`(.*?)`/g, '<code class="bg-secondary/40 px-1.5 py-0.5 rounded font-mono text-xs text-primary">$1</code>');

      const lineKey = `line-${processed.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '-')}-${processed.length}`;

      if (processed.startsWith('- ')) {
        return (
          <li 
            key={lineKey} 
            className="ml-4 list-disc text-foreground/90 mt-1" 
            dangerouslySetInnerHTML={{ __html: processed.substring(2) }} 
          />
        );
      }
      return (
        <p 
          key={lineKey} 
          className="mb-1.5 leading-relaxed text-foreground/90" 
          dangerouslySetInnerHTML={{ __html: processed }} 
        />
      );
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/95 hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200 relative group"
            title="Chat with AI"
          >
            <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping opacity-75 group-hover:opacity-0 transition-opacity" />
            <Sparkles size={24} className="animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-80 sm:w-96 h-[500px] glass-panel rounded-2xl shadow-2xl border border-border/40 overflow-hidden flex flex-col z-50"
          >
            {/* Header */}
            <div className="p-4 bg-primary text-primary-foreground flex items-center justify-between shadow-md">
              <div className="flex items-center space-x-2.5">
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold leading-tight">Outpro AI Assist</h4>
                  <span className="text-[10px] text-white/70 font-semibold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Agent Online</span>
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded transition-colors text-white/80 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/5">
              {messages.map((m) => (
                <div 
                  key={m.id} 
                  className={`flex items-start gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'ai' && (
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-1">
                      <Bot size={12} />
                    </div>
                  )}
                  <div className="relative group/msg flex items-center gap-2 max-w-[80%]">
                    <div className={`p-3 rounded-2xl text-sm shadow-sm border transition-all duration-200 ${
                      m.sender === 'user' 
                        ? 'bg-primary border-primary/20 text-primary-foreground rounded-tr-none' 
                        : 'bg-background border-border/40 text-foreground rounded-tl-none font-medium'
                    }`}>
                      {m.sender === 'ai' ? (
                        <div className="text-left">{formatMarkdown(m.text)}</div>
                      ) : (
                        <p>{m.text}</p>
                      )}
                    </div>

                    {m.sender === 'ai' && (
                      <button
                        onClick={() => handleCopy(m.id, m.text)}
                        className="opacity-0 group-hover/msg:opacity-100 p-1.5 rounded-lg bg-secondary/80 text-muted-foreground hover:text-foreground transition-all duration-150 shrink-0 self-end border border-border/40"
                        title="Copy Response"
                      >
                        {copiedId === m.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex items-start gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-1">
                    <Bot size={12} />
                  </div>
                  <div className="p-3 rounded-2xl rounded-tl-none bg-background border border-border/40 text-foreground text-sm flex space-x-1.5 items-center">
                    <span className="h-1.5 w-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Preset prompt chips */}
            {messages.length === 1 && (
              <div className="p-3 bg-secondary/20 border-t border-border/40 flex flex-wrap gap-1.5">
                {presets.map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePresetClick(p)}
                    className="text-[10px] font-bold text-primary bg-primary/5 hover:bg-primary hover:text-primary-foreground border border-primary/20 rounded-full px-2.5 py-1 transition-all"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Footer Input */}
            <div className="p-3 border-t border-border/40 bg-background flex gap-2">
              <input
                type="text"
                placeholder="Ask a question..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
                className="flex-grow px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button
                onClick={() => handleSendMessage(inputText)}
                className="h-9 w-9 bg-primary text-primary-foreground rounded-lg flex items-center justify-center hover:opacity-90 shadow-md transition-opacity"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
