import React, { useState } from "react";
import { GRASSHOPPER_TEMPLATES } from "../data";
import { Copy, Check, Download, Terminal, Code, Settings2, Sliders } from "lucide-react";

export default function CodeSection() {
  const [selectedTemplateId, setSelectedTemplateId] = useState("firefly_fft");
  const [copied, setCopied] = useState(false);
  
  // Custom user parameters to inject in real-time
  const [bassSens, setBassSens] = useState(1.5);
  const [midSens, setMidSens] = useState(1.2);
  const [highSens, setHighSens] = useState(2.0);

  const activeTemplate = GRASSHOPPER_TEMPLATES.find(t => t.id === selectedTemplateId) || GRASSHOPPER_TEMPLATES[0];

  // Dynamic code injection based on sliders
  const getProcessedCode = () => {
    let rawCode = activeTemplate.code;
    
    // Inject the real-time slider values into the python templates
    rawCode = rawCode.replace(/bass_sens in globals\(\) else 1\.5/g, `bass_sens in globals() else ${bassSens.toFixed(1)}`);
    rawCode = rawCode.replace(/mid_sens in globals\(\) else 1\.2/g, `mid_sens in globals() else ${midSens.toFixed(1)}`);
    rawCode = rawCode.replace(/high_sens in globals\(\) else 2\.0/g, `high_sens in globals() else ${highSens.toFixed(1)}`);

    return rawCode;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getProcessedCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([getProcessedCode()], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `acoustic_slime_${selectedTemplateId}.py`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 glow-green backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800/60">
        <div>
          <h2 className="text-xl font-display font-bold text-gray-150 flex items-center gap-2">
            <Terminal className="text-brand-primary w-5 h-5" />
            <span className="rtl font-sans tracking-tight">کدنویسی و تولید اسکریپت گرسهاپر</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1 rtl font-sans">
            اسکریپت‌های بهینه‌سازی شده پایتون (GHPython) را به صورت خودکار متناسب با پروژه‌تان خروجی بگیرید
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Interactive Parameter Customizer */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-slate-950/70 border border-slate-800 p-5 rounded-xl flex flex-col gap-4">
            <h3 className="text-xs uppercase font-mono tracking-wider text-gray-300 pb-2 border-b border-slate-900 flex items-center gap-2">
              <Code className="w-4 h-4 text-brand-primary" />
              <span className="rtl font-sans">۱. روش انتقال اطلاعات به راینو</span>
            </h3>

            {/* Template Selector list */}
            <div className="flex flex-col gap-2">
              {GRASSHOPPER_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={`p-3.5 rounded-xl border text-right cursor-pointer transition-all ${
                    selectedTemplateId === tpl.id
                      ? "bg-brand-primary/10 border-brand-primary/60 text-white"
                      : "border-slate-800/80 bg-slate-900/30 text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <div className="text-xs font-bold rtl font-sans mb-1">{tpl.title}</div>
                  <div className="text-[10px] text-gray-400 leading-relaxed rtl font-sans">{tpl.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Slider Injection details */}
          <div className="bg-slate-950/70 border border-slate-800 p-5 rounded-xl flex flex-col gap-4">
            <h3 className="text-xs uppercase font-mono tracking-wider text-gray-300 pb-2 border-b border-slate-900 flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-brand-secondary" />
              <span className="rtl font-sans">۲. ضریب حساسیت متغیرها</span>
            </h3>
            
            <p className="text-[10.5px] text-gray-400 leading-relaxed rtl font-sans">
              مقادیر ضریب زیر در زمان تولید کدهای پایتون به عنوان مقادیر پایه‌ای برای مپ کردن فرکانس‌ها به صورت خودکار تزریق می‌شوند:
            </p>

            <div className="flex flex-col gap-4 text-xs font-mono">
              {/* Bass sensitivity */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-gray-400 text-[11px]">
                  <span className="text-red-400 font-bold">{bassSens.toFixed(1)}x</span>
                  <span className="rtl font-sans">حساسیت بم (Bass Multiplier)</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  value={bassSens}
                  onChange={(e) => setBassSens(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
              </div>

              {/* Mids sensitivity */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-gray-400 text-[11px]">
                  <span className="text-emerald-400 font-bold">{midSens.toFixed(1)}x</span>
                  <span className="rtl font-sans">حساسیت میانه (Mids Multiplier)</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  value={midSens}
                  onChange={(e) => setMidSens(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              {/* High sensitivity */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-gray-400 text-[11px]">
                  <span className="text-cyan-400 font-bold">{highSens.toFixed(1)}x</span>
                  <span className="rtl font-sans">حساسیت زیر (Highs Multiplier)</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  value={highSens}
                  onChange={(e) => setHighSens(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Code Display IDE */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex flex-col h-full min-h-[460px]">
            {/* Code IDE Toolbar */}
            <div className="bg-slate-900 border-b border-slate-800 py-3 px-5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="font-mono text-gray-400 ml-2">acoustic_slime_mapping.py</span>
              </div>
              
              <div className="flex gap-2.5">
                <button
                  onClick={handleCopy}
                  className="py-1.5 px-3 rounded-md bg-slate-800/80 border border-slate-700/60 hover:text-white transition-all flex items-center gap-1.5 text-gray-400 cursor-pointer text-xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-brand-primary" />
                      <span>کپی شد!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>کپی کد</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownload}
                  className="py-1.5 px-3 rounded-md bg-brand-primary/20 border border-brand-primary/40 hover:bg-brand-primary/30 text-brand-primary transition-all flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>دانلود فایل .py</span>
                </button>
              </div>
            </div>

            {/* Simulated Editor Workspace */}
            <div className="p-4 overflow-auto flex-grow h-[350px] font-mono text-[11.5px] leading-relaxed select-text bg-slate-950">
              <pre className="text-emerald-400 whitespace-pre">
                {getProcessedCode()}
              </pre>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
