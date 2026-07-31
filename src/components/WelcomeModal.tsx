import React from 'react';
import { Sparkles, FileText, Image as ImageIcon, FileSpreadsheet, ShieldCheck, Zap, X, Linkedin, Github } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 sm:p-6 text-white relative pr-12">
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-9 h-9 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] sm:text-[11px] font-extrabold tracking-wider uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-200" /> Universal Compression Engine
            </span>
          </div>

          <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            Welcome to FileShrink AI
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1">
            Ultra-fast, 100% private client-side batch file compressor
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 text-stone-700 text-sm">
          <div className="space-y-3">
            <h3 className="font-extrabold uppercase text-xs tracking-wider text-stone-500">
              Key Platform Capabilities
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {/* Feature 1 */}
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-xs">Multi-Format Support</h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Compress PDFs, Images (JPG, PNG, WebP), and Word DOCX files seamlessly.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-xs">Batch Queue Engine</h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Drop dozens of files simultaneously and compress them all in sequence.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-xs">100% Client-Side Privacy</h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Your documents never leave your browser. Zero cloud uploads or storage.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-xs">Fine Compression Tuning</h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Select Extreme, Recommended, or Custom preset ratios for ultimate control.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Author Banner */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs text-stone-600">
                Created & Engineered by <strong className="text-stone-900 font-bold">Yashank</strong>
              </p>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Connect on LinkedIn or check out source projects on GitHub.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <a
                href="https://www.linkedin.com/in/yashank-rao-ben-61761533b/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial min-h-[40px] px-3 py-2 rounded-lg bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-600 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs"
              >
                <Linkedin className="w-3.5 h-3.5" />
                <span>LinkedIn</span>
              </a>

              <a
                href="https://github.com/Yashankrao06"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial min-h-[40px] px-3 py-2 rounded-lg bg-stone-900 text-white hover:bg-stone-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs"
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub</span>
              </a>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Start Using FileShrink AI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
