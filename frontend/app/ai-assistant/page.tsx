'use client';

import React, { useState, useEffect, useRef } from 'react';
import { sendAIChat } from '../../services/api';
import { MessageSquare, Bot, Send, Mic, MicOff, Volume2, VolumeX, Copy, Download, Trash2, ArrowLeft, RefreshCw, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [voiceInputActive, setVoiceInputActive] = useState(false);
  const [voiceOutputActive, setVoiceOutputActive] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const threadEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Load initial welcome message
    setMessages([
      {
        sender: 'ai',
        text: 'Hello! I am the Outpro.India Enterprise AI Assistant. I can help you with services, careers, custom B2B proposals, or invoice portals. Ask me anything!',
        timestamp: new Date()
      }
    ]);

    // Setup speech recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'en-US';

        rec.onresult = (e: any) => {
          const transcript = e.results[0][0].transcript;
          setInputText(transcript);
          setVoiceInputActive(false);
        };

        rec.onerror = (e: any) => {
          console.warn('Speech recognition error:', e.error);
          setVoiceInputActive(false);
        };

        rec.onend = () => {
          setVoiceInputActive(false);
        };

        recognitionRef.current = rec;
      }
    }
  }, []);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = { sender: 'user', text: textToSend, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const res = await sendAIChat(textToSend);
      if (res.success && res.data) {
        const aiMsg: ChatMessage = { sender: 'ai', text: res.data.reply, timestamp: new Date() };
        setMessages(prev => [...prev, aiMsg]);
        
        // Trigger voice synthesis
        if (voiceOutputActive) {
          speakText(res.data.reply);
        }
      } else {
        setMessages(prev => [...prev, { sender: 'ai', text: 'Error retrieving AI response.', timestamp: new Date() }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Could not connect to server.', timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported by your current browser.');
      return;
    }
    if (voiceInputActive) {
      recognitionRef.current.stop();
      setVoiceInputActive(false);
    } else {
      setVoiceInputActive(true);
      recognitionRef.current.start();
    }
  };

  const speakText = (text: string) => {
    if (typeof window === 'undefined') return;
    window.speechSynthesis.cancel(); // cancel current speech
    
    // Strip markdown characters from speech output
    const cleanText = text.replace(/[*#_\-`\[\]()]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleExport = () => {
    const formatted = messages.map(m => `[${m.sender.toUpperCase()} - ${m.timestamp.toLocaleTimeString()}]\n${m.text}`).join('\n\n');
    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(formatted);
    const link = document.createElement('a');
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `outpro_ai_chat_${Date.now()}.txt`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleReset = () => {
    setMessages([
      {
        sender: 'ai',
        text: 'Conversation reset. Ready for new questions!',
        timestamp: new Date()
      }
    ]);
  };

  // Basic custom markdown formatter to render bold, headers, and bullet points without external dependencies
  const formatMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      let content = line;
      
      // Bold tags
      content = content.replace(/\*\*([\s\S]*?)\*\*/g, '<strong>$1</strong>');
      // Inline code
      content = content.replace(/`([^`]+)`/g, '<code class="bg-secondary px-1.5 py-0.5 rounded text-primary text-xs font-mono">$1</code>');

      // Headings
      if (line.startsWith('### ')) {
        return <h4 key={lineIdx} className="text-base font-extrabold text-foreground mt-4 mb-2" dangerouslySetInnerHTML={{ __html: content.substring(4) }} />;
      }
      if (line.startsWith('## ')) {
        return <h3 key={lineIdx} className="text-lg font-extrabold text-foreground mt-5 mb-2" dangerouslySetInnerHTML={{ __html: content.substring(3) }} />;
      }
      if (line.startsWith('# ')) {
        return <h2 key={lineIdx} className="text-xl font-extrabold text-foreground mt-6 mb-3" dangerouslySetInnerHTML={{ __html: content.substring(2) }} />;
      }
      
      // Bullet list items
      if (line.startsWith('* ') || line.startsWith('- ')) {
        return <li key={lineIdx} className="ml-4 list-disc text-sm text-foreground/90 my-1.5" dangerouslySetInnerHTML={{ __html: content.substring(2) }} />;
      }

      return <p key={lineIdx} className="text-sm leading-relaxed text-foreground/90 my-2" dangerouslySetInnerHTML={{ __html: content }} />;
    });
  };

  const suggestionChips = [
    'Tell me about Outpro.India services',
    'Generate B2B custom quote',
    'How do I reschedule a meeting?',
    'What features are inside the Admin panel?'
  ];

  return (
    <div className="py-12 max-w-5xl mx-auto px-4 sm:px-6 relative h-[85vh] flex flex-col justify-between">
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <section className="glass-panel p-4 rounded-2xl flex justify-between items-center shrink-0 border border-border/40">
        <div className="flex items-center space-x-3">
          <Link href="/dashboard" className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
              <Bot size={22} />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-foreground">AI Intelligence Agent</h1>
              <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
                <span>RAG Engine Online</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setVoiceOutputActive(!voiceOutputActive)}
            className="p-2 hover:bg-secondary rounded-lg border border-border/40 text-muted-foreground hover:text-foreground"
            title={voiceOutputActive ? "Mute Speech Output" : "Unmute Speech Output"}
          >
            {voiceOutputActive ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button
            onClick={handleExport}
            className="p-2 hover:bg-secondary rounded-lg border border-border/40 text-muted-foreground hover:text-foreground"
            title="Download Transcript"
          >
            <Download size={16} />
          </button>
          <button
            onClick={handleReset}
            className="p-2 hover:bg-secondary rounded-lg border border-border/40 text-destructive hover:bg-destructive/10"
            title="Reset Conversation"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </section>

      {/* Messages Stream */}
      <section className="flex-grow my-6 overflow-y-auto p-4 space-y-4 bg-secondary/5 rounded-2xl border border-border/20 max-h-[55vh]">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-4 rounded-2xl max-w-[85%] border shadow-sm relative group ${
              m.sender === 'user'
                ? 'bg-primary border-primary/20 text-primary-foreground rounded-tr-none'
                : 'bg-card border-border/40 text-foreground rounded-tl-none font-medium'
            }`}>
              {m.sender === 'user' ? (
                <p className="text-sm font-semibold">{m.text}</p>
              ) : (
                <div className="space-y-1.5">
                  {formatMarkdown(m.text)}
                  <button
                    onClick={() => handleCopy(m.text, idx)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-secondary rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                    title="Copy response"
                  >
                    <Copy size={12} />
                  </button>
                  {copiedIndex === idx && (
                    <span className="absolute top-2 right-8 text-[9px] bg-emerald-500 text-white rounded px-1.5 py-0.5">Copied!</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="p-4 rounded-2xl rounded-tl-none bg-card border border-border/40 flex space-x-1.5 items-center">
              <span className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={threadEndRef} />
      </section>

      {/* Suggested Questions */}
      {messages.length === 1 && (
        <section className="mb-4 flex flex-wrap gap-2 shrink-0 justify-center">
          {suggestionChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              className="px-3.5 py-1.5 text-xs font-bold text-primary bg-primary/5 hover:bg-primary hover:text-primary-foreground border border-primary/20 rounded-full transition-all"
            >
              {chip}
            </button>
          ))}
        </section>
      )}

      {/* Input controls */}
      <section className="glass-panel p-3 border border-border/40 rounded-2xl shrink-0 flex gap-2 items-center bg-background">
        <button
          onClick={toggleVoiceInput}
          className={`h-11 w-11 rounded-xl flex items-center justify-center border transition-all ${
            voiceInputActive 
              ? 'bg-destructive border-destructive/20 text-destructive-foreground animate-pulse' 
              : 'bg-secondary border-border/40 text-foreground hover:bg-accent'
          }`}
          title={voiceInputActive ? "Listening..." : "Voice Input"}
        >
          {voiceInputActive ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        <input
          type="text"
          placeholder={voiceInputActive ? "Listening to transcription..." : "Send a message or trigger proposal builder..."}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend(inputText)}
          className="flex-grow px-4 py-2 bg-transparent text-sm border-0 focus:outline-none focus:ring-0 text-foreground font-medium"
        />

        <button
          onClick={() => handleSend(inputText)}
          className="h-11 px-5 bg-primary text-primary-foreground rounded-xl flex items-center gap-1.5 hover:opacity-90 font-bold text-xs"
        >
          <span>Send</span>
          <Send size={12} />
        </button>
      </section>
    </div>
  );
}
