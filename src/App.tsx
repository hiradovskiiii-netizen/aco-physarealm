import React, { useState } from "react";
import ACOSector from "./components/ACOSector";
import GuideSection from "./components/GuideSection";
import CodeSection from "./components/CodeSection";
import AIAssistant from "./components/AIAssistant";
import { Sparkles, Terminal, BookOpen, Layers, Compass, ExternalLink } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"simulation" | "guide" | "code" | "assistant">("simulation");

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 flex flex-col relative overflow-x-hidden selection:bg-brand-primary selection:text-slate-950 pb-16">
      
      {/* Bioluminescent background shapes */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-3xl -z-20 ambient-pulse"></div>
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-brand-secondary/5 rounded-full blur-3xl -z-20"></div>

      {/* Decorative fluorescent status bar */}
      <div className="h-1 bg-gradient-to-r from-brand-primary via-brand-secondary to-emerald-400"></div>

      {/* Modern High-End Top Header */}
      <header className="border-b border-slate-900 bg-slate-950/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo Brand Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-secondary p-0.5 flex items-center justify-center shadow-lg shadow-brand-primary/10">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Layers className="w-5 h-5 text-brand-primary animate-pulse" />
              </div>
            </div>
            <div>
              <h1 className="text-md sm:text-lg font-display font-bold text-white tracking-tight flex items-center gap-1.5 leading-none">
                ACO & Physarealm Acoustic Sync Lab
              </h1>
              <p className="text-[10px] sm:text-[11px] text-gray-400 font-mono tracking-wide mt-1 uppercase text-left">
                Computational Slime Mold Orchestrator • Bio-Inspired Media
              </p>
            </div>
          </div>

          {/* Persian Subheading Indicator */}
          <div className="text-right hidden sm:block">
            <span className="text-xs text-brand-secondary font-mono bg-brand-secondary/10 px-3 py-1.5 rounded-full border border-brand-secondary/20 rtl font-sans">
              اتصال فرکانس موسیقی به رفتارهای کلونی مورچه و اسلایم
            </span>
          </div>
        </div>
      </header>

      {/* Primary Workspace Main Content Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex-grow w-full flex flex-col gap-8">
        
        {/* Intro Banner Card */}
        <section className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 text-right md:order-last">
            <h2 className="text-lg sm:text-xl font-display font-medium text-white mb-2 rtl font-sans flex items-center justify-end gap-2">
              <Sparkles className="text-brand-primary w-5 h-5" />
               جهت مدلسازی تارهای بیولوژیک با موسیقی
            </h2>
            <p className="text-xs sm:text-[13px] text-gray-300 leading-relaxed rtl font-sans">
              به آزمایشگاه تعاملی و علمی کپک مخاطی خوش آمدید. این فضا طراحی شده تا فرکانس‌های بم، میانه و زیر صوتی را با رفتارهای حرکت جمعی قارچ اسلایم 
              (مبنای عملکرد پلاگین <span className="text-brand-primary font-mono font-semibold">Physarealm</span> در گرسهاپر) یا الگوریتم بهینه‌سازی مورچگان ترکیب کنید. 
              از شبیه‌ساز زنده استفاده کنید، الگوهای کد پایتون پودمان را دریافت کنید و با دوقلوی هوش مصنوعی پروژه خود را مشاوره دهید.
            </p>
          </div>
          
          <div className="flex gap-4.5 flex-wrap justify-center flex-shrink-0 md:order-first">
            <div className="bg-slate-950 border border-slate-850 py-3.5 px-6 rounded-xl text-center glow-green">
              <div className="text-xs text-brand-primary font-mono font-bold">100% HALLUCINATION FREE</div>
              <div className="text-[10px] text-gray-500 font-mono mt-1">REAL GEOMETRIC INPUTS</div>
            </div>
            <div className="bg-slate-950 border border-slate-850 py-3.5 px-6 rounded-xl text-center glow-cyan">
              <div className="text-xs text-brand-secondary font-mono font-bold">LIVE FFT MULTIPLEXER</div>
              <div className="text-[10px] text-gray-500 font-mono mt-1">BROWSER SYNTH SEQUENCER</div>
            </div>
          </div>
        </section>

        {/* Workspace Quick-Tabs Nav Selector */}
        <nav className="flex items-center justify-center flex-wrap gap-2.5 font-sans">
          <button
            onClick={() => setActiveTab("simulation")}
            className={`px-5 py-3 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "simulation"
                ? "bg-brand-primary text-slate-950 border-transparent font-semibold shadow-lg shadow-brand-primary/10"
                : "bg-slate-900/40 border-slate-800 text-gray-400 hover:text-white"
            }`}
          >
            <Layers className="w-4.5 h-4.5" />
            <span className="rtl">شبیه‌ساز ذرات و آنالیزور موسیقی</span>
          </button>
          <button
            onClick={() => setActiveTab("guide")}
            className={`px-5 py-3 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "guide"
                ? "bg-brand-secondary text-slate-950 border-transparent font-semibold shadow-lg shadow-brand-secondary/10"
                : "bg-slate-900/40 border-slate-800 text-gray-400 hover:text-white"
            }`}
          >
            <BookOpen className="w-4.5 h-4.5" />
            <span className="rtl">دفترچه و نقشه راه دقیق گرسهاپر</span>
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`px-5 py-3 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "code"
                ? "bg-emerald-600 text-white border-transparent font-semibold shadow-lg shadow-emerald-600/10"
                : "bg-slate-900/40 border-slate-800 text-gray-400 hover:text-white"
            }`}
          >
            <Terminal className="w-4.5 h-4.5" />
            <span className="rtl">تولیدکننده اسکریپت پایتون راینو</span>
          </button>
          <button
            onClick={() => setActiveTab("assistant")}
            className={`px-5 py-3 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "assistant"
                ? "bg-purple-600 text-white border-transparent font-semibold shadow-lg shadow-purple-600/10"
                : "bg-slate-900/40 border-slate-800 text-gray-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-4.5 h-4.5" />
            <span className="rtl">دستیار هوش مصنوعی گرسهاپر</span>
          </button>
        </nav>

        {/* Dynamic Panel Mount */}
        <section className="transition-all duration-300">
          {activeTab === "simulation" && <ACOSector />}
          {activeTab === "guide" && <GuideSection />}
          {activeTab === "code" && <CodeSection />}
          {activeTab === "assistant" && <AIAssistant />}
        </section>

        {/* External Grasshopper Resource Index */}
        <section className="mt-4 bg-slate-950 border border-slate-900 rounded-2xl p-6 text-right">
          <h3 className="text-sm font-display font-medium text-white mb-3 rtl font-sans">
            فهرست دسترسی سریع به منابع ابزارهای آکوستیک:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <a
              href="https://www.food4rhino.com/en/app/physarealm"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-slate-900/40 border border-slate-850 hover:border-brand-primary/50 rounded-xl transition-all flex justify-between items-center group cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-brand-primary transition-all" />
              <div className="rtl font-sans">
                <div className="font-semibold text-gray-200">دانلود پلاگین Physarealm</div>
                <div className="text-[10px] text-gray-400 mt-0.5 font-mono">Food4Rhino Developer Link</div>
              </div>
            </a>
            
            <a
              href="https://www.food4rhino.com/en/app/ghowl"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-slate-900/40 border border-slate-850 hover:border-brand-secondary/50 rounded-xl transition-all flex justify-between items-center group cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-brand-secondary transition-all" />
              <div className="rtl font-sans">
                <div className="font-semibold text-gray-200">دانلود پلاگین gHowl</div>
                <div className="text-[10px] text-gray-400 mt-0.5 font-mono">Open ports & UDP Listeners</div>
              </div>
            </a>

            <a
              href="https://www.food4rhino.com/en/app/firefly"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-slate-900/40 border border-slate-850 hover:border-emerald-400/50 rounded-xl transition-all flex justify-between items-center group cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 transition-all" />
              <div className="rtl font-sans">
                <div className="font-semibold text-gray-200">دانلود پلاگین Firefly</div>
                <div className="text-[10px] text-gray-400 mt-0.5 font-mono">Real-time Sound FFT nodes</div>
              </div>
            </a>
          </div>
        </section>

      </main>

      {/* Humble Footer */}
      <footer className="mt-auto pt-16 border-t border-slate-900 text-center text-xs text-gray-500 font-mono select-none">
        <div>ACO-PHYSARUM SWARM EXPERIMENTAL BLUEPRINT • BIOLOGIC ACOUSTIC SYNCHRONY LAB</div>
        <div className="text-[10px] text-gray-600 mt-1">PERSISTENT BUILD VS-1.0.4 • GRASSHOPPER GUIDES READY FOR DEPLOYMENT</div>
      </footer>
    </div>
  );
}
