import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, AccessibilityPreferences } from '../types';
import { LANGUAGES } from '../data';
import { Send, Bot, User, Sparkles, Volume2, VolumeX, CheckCircle2 } from 'lucide-react';

interface ChatBotProps {
  currentLanguage: string;
  setCurrentLanguage: (lang: string) => void;
  accessibilityPreferences?: AccessibilityPreferences; // Inject current accessibility pref filters
}

export default function ChatBot({
  currentLanguage,
  setCurrentLanguage,
  accessibilityPreferences
}: ChatBotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I am your FIFA World Cup 2026 Stadium Assistant, wired to the MetLife Central Context Engine. I can translate directions, locate vegan dining, and optimize step-free corridors.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const speakText = (id: string, text: string) => {
    if (isMuted) return;
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      if (isSpeaking === id) {
        setIsSpeaking(null);
        return;
      }
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const langObj = LANGUAGES.find(l => l.name === currentLanguage);
    if (langObj) {
      utterance.lang = langObj.code;
    }

    utterance.onend = () => setIsSpeaking(null);
    utterance.onerror = () => setIsSpeaking(null);

    setIsSpeaking(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const historyPayload = messages.map(m => ({
        role: m.sender === 'assistant' ? 'model' : 'user',
        content: m.text
      }));

      // Ingest accessibility parameters if they exist
      const accessibilityDetails = accessibilityPreferences 
        ? { originId: 'sec-101', destId: 'sec-112', ...accessibilityPreferences }
        : undefined;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
          language: currentLanguage,
          accessibilityPreferences: accessibilityDetails
        })
      });

      if (!res.ok) throw new Error('API server unreachable.');

      const data = await res.json();
      
      const botMsg: ChatMessage = {
        id: `msg-${Date.now()}-bot`,
        sender: 'assistant',
        text: data.text || 'Transmission error.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        meta: data.meta,
        routeInfo: data.routeInfo
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      const botErrorMsg: ChatMessage = {
        id: `msg-${Date.now()}-bot-err`,
        sender: 'assistant',
        text: `Error connecting to Central Context Engine: ${err.message || 'Server offline'}. Offline Fallback: Elevator systems are fully active at Gates A, B, and C. Section 103 contains the core First Aid base.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botErrorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    { label: '🎫 Restrooms near Gate A?', text: 'Where is the nearest restroom to Gate A?' },
    { label: '🌱 Vegan and Organic food?', text: 'Where can I buy organic and vegan food options?' },
    { label: '♿ Step-free access Section 101', text: 'How do I reach section 101 safely with wheelchair?' },
    { label: '🚌 Manhattan Train/Bus Transit', text: 'What is the schedule and cost for buses to Manhattan?' }
  ];

  return (
    <div id="stadium-chatbot-card" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col h-[520px] shadow-2xl space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-semibold text-slate-100 text-sm">FIFA Multilingual Assistant</h4>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
              <Sparkles className="w-3 h-3 text-indigo-400" /> Ingests Central StadiumContext
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={currentLanguage}
            onChange={(e) => {
              setCurrentLanguage(e.target.value);
              handleSendMessage(`System command: Please switch our language to ${e.target.value} and greet me.`);
            }}
            className="bg-slate-950 text-xs text-indigo-300 font-mono border border-slate-800 px-2.5 py-1 rounded focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.name}>
                {lang.native} ({lang.name})
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-1.5 rounded border transition-all cursor-pointer ${
              isMuted ? 'text-red-400 border-red-950 bg-red-950/20' : 'text-indigo-400 border-slate-800 hover:bg-slate-850'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            <div className={`p-2 rounded-xl h-fit shadow ${
              msg.sender === 'user' ? 'bg-indigo-950 text-indigo-300' : 'bg-slate-950 text-slate-400'
            }`}>
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-indigo-400" />}
            </div>

            <div className="space-y-1.5 flex-1">
              <div className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-md ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-slate-950 text-slate-200 border border-slate-850 rounded-tl-none'
              }`}>
                {msg.text}

                {/* Render grounded accessibility route directions inside bubble if present */}
                {msg.routeInfo && (
                  <div className="mt-2.5 bg-slate-900 border border-slate-850 rounded-lg p-2.5 space-y-1.5">
                    <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider font-mono flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Accessible Route Calculated
                    </span>
                    <p className="text-[10px] text-slate-300 italic">{msg.routeInfo.explanation}</p>
                  </div>
                )}

                {/* Metadata details on assistant bubbles */}
                {msg.sender === 'assistant' && (
                  <div className="mt-2.5 flex items-center justify-between border-t border-slate-850 pt-1.5 text-[8px] font-mono text-slate-500">
                    {msg.meta ? (
                      <span className="flex items-center gap-1.5">
                        <span>Latency: <strong>{msg.meta.latencyMs}ms</strong></span>
                        <span>Cache: <strong>{msg.meta.cache}</strong></span>
                        <span>Context: <strong>v{msg.meta.contextVersion}</strong></span>
                      </span>
                    ) : (
                      <span>Offline Client Library</span>
                    )}

                    <button
                      onClick={() => speakText(msg.id, msg.text)}
                      className={`text-[8px] font-bold flex items-center gap-1 py-0.5 px-2 rounded transition-all ${
                        isSpeaking === msg.id ? 'bg-red-500/10 text-red-400 animate-pulse' : 'text-indigo-400 hover:bg-slate-850'
                      }`}
                    >
                      <Volume2 className="w-3 h-3" />
                      {isSpeaking === msg.id ? 'Mute' : 'Speak'}
                    </button>
                  </div>
                )}

                {msg.sender === 'user' && (
                  <div className="mt-1 text-right">
                    <span className="text-[9px] text-indigo-200 font-mono">{msg.timestamp}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 max-w-[80%]">
            <div className="p-2 rounded-xl bg-slate-950 text-indigo-400 shadow">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-950 text-slate-400 border border-slate-850 p-3 rounded-2xl rounded-tl-none text-xs flex items-center gap-1.5">
              <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce"></span>
              <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce delay-100"></span>
              <span className="text-[9px] text-slate-500 font-mono ml-1">Central context engine routing...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Preset FAQS */}
      <div>
        <span className="block text-[9px] text-slate-500 font-bold mb-1.5 font-mono">POPULAR TOURIST FAQS</span>
        <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
          {quickPrompts.map((pill, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(pill.text)}
              className="bg-slate-950 hover:bg-slate-850 border border-slate-850 hover:border-slate-800 text-[10px] text-slate-300 px-2.5 py-1.5 rounded-full transition-all text-left cursor-pointer"
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputText);
        }}
        className="flex items-center gap-2 bg-slate-950 rounded-xl p-1.5 border border-slate-800 focus-within:border-indigo-500 transition-all"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Ask anything in ${currentLanguage}...`}
          disabled={isLoading}
          className="flex-1 bg-transparent border-none text-xs text-slate-200 px-3 focus:outline-none focus:ring-0 placeholder:text-slate-500"
        />

        <button
          type="submit"
          disabled={isLoading || !inputText.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white p-2.5 rounded-lg transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
