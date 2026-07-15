import React from 'react';
import { Sparkles, Shield, Compass, BookOpen, Layers, CheckCircle2, ChevronRight } from 'lucide-react';

export default function AiTransparency() {
  const steps = [
    { title: '1. User Input', desc: 'Secure web input passes client-side sanitation blocks.' },
    { title: '2. Input Guardrails', desc: 'Checks keywords for security, safety threats, and XSS patterns.' },
    { title: '3. Context Injection', desc: 'Appends live, deterministic, real-time MetLife Stadium data.' },
    { title: '4. Cache Lookup', desc: 'Saves 300s compute if identical query signatures match context revs.' },
    { title: '5. Gemini Reasoning', desc: 'Executes generative content using safe system prompt guidelines.' },
    { title: '6. Schema Parsing', desc: 'Zod strictly validates output structure against active contracts.' },
    { title: '7. Output Polish', desc: 'Filters and censors high-severity panic terms (e.g. stampede).' },
    { title: '8. Human Review', desc: 'Operational broadcasts require manual staff-authorized approvals.' }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6" id="ai-transparency-view">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 uppercase font-mono tracking-wider">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          MetLife GenAI Transparency & Grounding Charter
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Complete disclosure of artificial intelligence integration, deterministic safety barriers, and model limits during the FIFA World Cup 2026.
        </p>
      </div>

      {/* Grid: Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5 font-mono">
            <Layers className="w-4 h-4 text-indigo-400" />
            Deterministic vs. Generative Divisions
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Our architecture splits tasks rigorously:
          </p>
          <div className="space-y-2 text-[11px] font-mono">
            <div className="bg-slate-900 p-2 rounded border border-slate-800">
              <span className="text-emerald-400 font-bold block">1. DETERMINISTIC SYSTEM (100% Reliable Truth)</span>
              <p className="text-slate-400 text-[10px] mt-0.5 font-sans">
                Calculates concourse route cost weights, wheelchair elevator bypass checks, energy usage, and transit loads.
              </p>
            </div>
            <div className="bg-slate-900 p-2 rounded border border-slate-800">
              <span className="text-indigo-400 font-bold block">2. GENERATIVE LAYER (Adaptive Translation)</span>
              <p className="text-slate-400 text-[10px] mt-0.5 font-sans">
                Translates answers to Spanish/Portuguese, compiles operations executive briefing documents, and formats Jumbotron advisory messages.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5 font-mono">
            <Shield className="w-4 h-4 text-amber-400" />
            Hallucination Countermeasures
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            To prevent the model from generating fake stadium data, gates, or incorrect fees:
          </p>
          <ul className="space-y-2 text-[11px] text-slate-400 font-sans">
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Context Lock:</strong> System prompts instruct the LLM to rely exclusively on the live Digital Twin snapshot.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Zod Guarding:</strong> If Gemini provides a malformed response schema, a strict Zod parser rejects the packet and invokes a local deterministic fallback.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Human-in-the-Loop:</strong> No generated broadcast reaches the stadium display screens without a physical operator approving the proposal.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* AI Pipeline Flowchart */}
      <div className="bg-slate-950 p-5 rounded-xl border border-slate-850 space-y-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide font-mono flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          End-to-End Stadium AI Pipeline Flow
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {steps.map((step, index) => (
            <div key={index} className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg flex flex-col justify-between space-y-1">
              <span className="text-[10px] font-bold text-indigo-400 font-mono block">{step.title}</span>
              <p className="text-[9px] text-slate-400 font-sans leading-normal">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
