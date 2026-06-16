import React, { useState, useRef, useEffect } from "react";
import { Message } from "../types";
import { Send, Sparkles, User, Bot, Loader2, ArrowLeft } from "lucide-react";

const SUGGESTIONS = [
  "چرا فرکانس بیس باعث تلاطم و از هم پاشیدگی نماینده‌های اسلایم می‌شود؟",
  "کد دریافت و نرم‌سازی (Smoothing) فرکانس‌ها در گرسهاپر را بنویس",
  "چگونه مسیرهای ذرات را به توری بامتراژ و صلب سه بعدی تبدیل کنم؟",
  "تنظیمات پیشنهادی برای شبیه‌سازی ساختار درختی و رگ‌برگ‌های ارگانیک"
];

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      role: "assistant",
      content: "سلام! من مشاور تخصصی شما در زمینه مدلسازی محاسباتی، الگوریتم‌های بهینه‌سازی (ACO)، قارچ‌های بیولوژیک (Physarealm) و انیمیشن صوتی زنده هستم. چطور می‌توانم در اتصال هندسه دیجیتالی‌تان به سیگنال‌های صوتی و موسیقی بدون خطا راهنمایی‌تان کنم؟",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to message bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      });

      if (!response.ok) {
        throw new Error("خطا در پاسخگویی سرور هوش مصنوعی");
      }

      const data = await response.json();
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.text || "پاسخ خالی دریافت شد.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "متاسفانه مشکلی در برقراری ارتباط با مدل پیش آمد. اطمینان حاصل کنید کلید API به درستی تنظیم شده باشد یا دوباره تلاش کنید.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800/85 rounded-2xl flex flex-col h-[560px] relative overflow-hidden backdrop-blur-xl">
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -z-10"></div>

      {/* Header */}
      <div className="bg-slate-950/80 border-b border-slate-800/80 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="text-brand-primary w-4 h-4 animate-pulse" />
          <span className="text-xs font-mono font-bold text-gray-400">ACO & PHYSARUM COMP_AI</span>
        </div>
        <div className="text-right">
          <h3 className="text-sm font-display font-semibold text-white rtl">دستیار تخصصی فرمالیسم محاسباتی</h3>
          <p className="text-[10px] text-gray-400 rtl">همگام‌سازی بیومتریک و موسیقی</p>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-[85%] ${
              msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            }`}
          >
            {/* Avatar icon */}
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${
                msg.role === "user"
                  ? "bg-brand-primary/10 border-brand-primary/40 text-brand-primary"
                  : "bg-slate-800 border-slate-700 text-brand-secondary"
              }`}
            >
              {msg.role === "user" ? <User className="w-4.5 h-4.5" /> : <Bot className="w-4.5 h-4.5" />}
            </div>

            {/* Bubble content */}
            <div
              className={`p-3.5 rounded-2xl text-xs leading-relaxed text-right word-break rtl ${
                msg.role === "user"
                  ? "bg-brand-primary/15 text-white rounded-tr-none border border-brand-primary/15"
                  : "bg-slate-950/80 border border-slate-850 text-gray-250 rounded-tl-none"
              }`}
            >
              <div className="whitespace-pre-line text-xs font-sans">
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex gap-3 mr-auto max-w-[85%]">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-brand-secondary flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
            </div>
            <div className="p-4 bg-slate-950/50 border border-slate-850 text-gray-400 rounded-2xl rounded-tl-none text-xs flex items-center gap-2 rtl font-sans">
              <span>درحال بررسی و تولید راهنمای هندسی...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Suggestion list */}
      {messages.length < 3 && (
        <div className="px-4 pb-2 pt-1 border-t border-slate-850 hover:bg-slate-950/10 transition-all">
          <div className="text-[10px] text-gray-500 mb-1.5 text-right rtl font-sans">سوالات پیشنهادی متداول:</div>
          <div className="flex flex-col gap-1.5">
            {SUGGESTIONS.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(sug)}
                className="py-1 px-3 rounded-md bg-slate-950/60 border border-slate-800 text-right text-[10px] text-gray-300 hover:text-brand-primary hover:border-brand-primary/50 transition-all font-sans cursor-pointer flex items-center justify-between gap-2"
              >
                <ArrowLeft className="w-3 h-3 text-gray-600 flex-shrink-0" />
                <span className="rtl truncate">{sug}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input formulation bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(input);
        }}
        className="p-3 bg-slate-950/80 border-t border-slate-800/80 flex gap-2"
      >
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="bg-brand-primary hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-brand-primary text-slate-950 py-2.5 px-4 rounded-xl cursor-pointer transition-all flex items-center justify-center glow-green"
        >
          <Send className="w-4.5 h-4.5" />
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="سوال خود در مورد راه‌اندازی، پارامترهای صوتی یا پلاگین‌ها بپرسید..."
          className="flex-grow bg-slate-900 border border-slate-800 rounded-xl px-4 text-xs rtl text-right text-gray-200 outline-none focus:border-brand-primary/60 placeholder:text-gray-500 font-sans"
        />
      </form>
    </div>
  );
}
