import React, { useState } from "react";
import { EDUCATION_GUIDE } from "../data";
import { BookOpen, Map, HelpCircle, GitCommit, CheckCircle, Flame, Server } from "lucide-react";

export default function GuideSection() {
  const [activeTab, setActiveTab] = useState<"theory" | "setup" | "mappings" | "pitfalls">("theory");

  return (
    <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 glow-cyan backdrop-blur-xl relative">
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-secondary/5 rounded-full blur-3xl -z-10"></div>

      {/* Section Header */}
      <div className="mb-6 pb-4 border-b border-slate-800/60 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-gray-150 flex items-center gap-2">
            <BookOpen className="text-brand-secondary w-5 h-5" />
            <span className="rtl font-sans tracking-tight">نقشه راهنمای معماری صوتی با گرسهاپر</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1 rtl font-sans">
            دستورالعمل گام‌به‌گام و علمی برای تعامل زنده موسیقی بر الگوریتم‌های Physarealm و ACO
          </p>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-800 text-xs md:text-sm font-sans mb-6 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab("theory")}
          className={`pb-3 px-4 font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border-b-2 hover:text-white ${
            activeTab === "theory"
              ? "border-brand-secondary text-brand-secondary font-bold"
              : "border-transparent text-gray-400"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span className="rtl">۱. مبانی علمی تفاوت‌ها</span>
        </button>
        <button
          onClick={() => setActiveTab("setup")}
          className={`pb-3 px-4 font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border-b-2 hover:text-white ${
            activeTab === "setup"
              ? "border-brand-secondary text-brand-secondary font-bold"
              : "border-transparent text-gray-400"
          }`}
        >
          <Map className="w-4 h-4" />
          <span className="rtl">۲. سناریوی گام‌به‌گام راه‌اندازی</span>
        </button>
        <button
          onClick={() => setActiveTab("mappings")}
          className={`pb-3 px-4 font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border-b-2 hover:text-white ${
            activeTab === "mappings"
              ? "border-brand-secondary text-brand-secondary font-bold"
              : "border-transparent text-gray-400"
          }`}
        >
          <GitCommit className="w-4 h-4" />
          <span className="rtl">۳. ماتریس تطبیق پارامترها</span>
        </button>
        <button
          onClick={() => setActiveTab("pitfalls")}
          className={`pb-3 px-4 font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border-b-2 hover:text-white ${
            activeTab === "pitfalls"
              ? "border-brand-secondary text-brand-secondary font-bold"
              : "border-transparent text-gray-400"
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span className="rtl">۴. حل معایب و ارورهای متداول</span>
        </button>
      </div>

      {/* Core View Panels */}
      <div className="font-sans leading-relaxed text-sm text-gray-300">
        
        {/* Theory Tab */}
        {activeTab === "theory" && (
          <div className="flex flex-col gap-6">
            {EDUCATION_GUIDE.coreConcepts.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-950/50 hover:bg-slate-950/80 transition-all border border-slate-800 p-5 rounded-xl flex flex-col gap-3 rtl"
              >
                <h4 className="text-sm font-display font-semibold text-brand-secondary flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary"></span>
                  {item.title}
                </h4>
                <div className="text-[13px] text-gray-300 whitespace-pre-line leading-relaxed">
                  {item.content}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Setup Tab */}
        {activeTab === "setup" && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {EDUCATION_GUIDE.stepByStepSetup.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/40 hover:bg-slate-950/70 transition-all border border-slate-800 p-5 rounded-xl flex flex-col gap-2 relative overflow-hidden rtl"
                >
                  <div className="absolute top-0 left-0 w-12 h-12 bg-brand-secondary/5 rounded-br-3xl flex items-center justify-center font-mono font-bold text-lg text-brand-secondary/40 select-none">
                    0{idx + 1}
                  </div>
                  <h4 className="text-[13.5px] font-display font-semibold text-white mb-2 pl-4">
                    {item.step}
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed pl-2 whitespace-pre-line">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>

            {/* General Flowchart Concept */}
            <div className="bg-slate-950 p-4 border border-slate-800/60 rounded-xl mt-2 rtl text-xs flex flex-col md:flex-row items-center justify-around gap-4 text-center">
              <div className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-red-400 font-semibold w-full md:w-auto">
                AUDIO / FFT (موسیقی زنده)
              </div>
              <div className="text-gray-500 font-mono hidden md:block">→</div>
              <div className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-cyan-400 font-semibold w-full md:w-auto">
                FIREFLY / gHOWL (گرسهاپر)
              </div>
              <div className="text-gray-500 font-mono hidden md:block">→</div>
              <div className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-emerald-400 font-semibold w-full md:w-auto">
                PHYSAREALM AGENT SETTINGS (تطبیق)
              </div>
              <div className="text-gray-500 font-mono hidden md:block">→</div>
              <div className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-semibold w-full md:w-auto">
                MESH / COCOON (حجم هندسی)
              </div>
            </div>
          </div>
        )}

        {/* Mappings Tab */}
        {activeTab === "mappings" && (
          <div className="flex flex-col gap-4 rtl">
            <div className="text-xs text-gray-400 mb-2">
              توضیح عملکرد و پیشنهاد نگاشت فیزیکی هریک از ورودی‌های پلاگین Physarealm به ساختار امواج صوتی:
            </div>
            
            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left font-sans text-xs">
                <thead className="bg-slate-950 text-gray-400 uppercase text-right border-b border-slate-800">
                  <tr>
                    <th className="p-3.5 text-right">عنوان پارامتر اصلی</th>
                    <th className="p-3.5 text-right">مخفف</th>
                    <th className="p-3.5 text-right">نقش هندسی و فیزیکی در فرم</th>
                    <th className="p-3.5 text-right text-brand-secondary font-bold">پیشنهاد اتصال به فرکانس</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 bg-slate-950/30 text-right">
                  {EDUCATION_GUIDE.parametricMappings.map((map, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/30 transition-all font-sans text-[12.5px]">
                      <td className="p-3.5 font-bold text-gray-150">{map.name}</td>
                      <td className="p-3.5 font-mono text-cyan-400 uppercase">{map.abbreviation}</td>
                      <td className="p-3.5 text-gray-300">{map.role}</td>
                      <td className="p-3.5 font-sans font-semibold text-brand-primary">{map.suggestion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl mt-2 text-xs text-gray-400 flex items-start gap-3">
              <CheckCircle className="text-brand-secondary w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">نکته طلایی معماری: </strong>
                با استفاده از ترکیب این نگاشت‌ها، می‌توانید در لحظات پر انرژی موسیقی (بیس بالا و ملودی غنی) با بزرگتر کردن فاصله دید (SO) و پایین آوردن تبخیر (Decay) مانع محو شدن سریع خطوط شوید تا تارهای منسجم عریضی ایجاد گردند که هندسه اصلی خانه یا حجم معماری را تشکیل دهند.
              </div>
            </div>
          </div>
        )}

        {/* Pitfalls Tab */}
        {activeTab === "pitfalls" && (
          <div className="flex flex-col gap-4 rtl">
            {EDUCATION_GUIDE.commonPitfalls.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-950/60 border border-slate-800 p-5 rounded-xl flex flex-col gap-2"
              >
                <h4 className="text-sm font-display font-semibold text-red-400 flex items-center gap-2">
                  <Flame className="w-4 h-4" />
                  {item.title}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-sans mt-1">
                  {item.solution}
                </p>
              </div>
            ))}

            <div className="bg-slate-950/30 border border-slate-850 p-4 rounded-xl text-center text-[11px] font-mono text-gray-500">
              PHYSARUM INTEGRITY MATRIX • VERIFICATION VERDICT - STABLE • RHINO 3D INTEGRATED
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
