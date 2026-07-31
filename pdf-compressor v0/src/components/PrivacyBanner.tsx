import React from 'react';
import { Shield, Cpu, Lock, Zap } from 'lucide-react';

export const PrivacyBanner: React.FC = () => {
  return (
    <div className="w-full max-w-3xl mx-auto bg-emerald-50 border border-emerald-100 rounded-xl p-6 shadow-xs">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-emerald-950">Zero-Server Privacy</h4>
            <p className="text-xs text-emerald-800/80 mt-0.5 leading-relaxed">
              Files never leave this window. Processed 100% on your local browser CPU.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-emerald-950">WASM Sandbox</h4>
            <p className="text-xs text-emerald-800/80 mt-0.5 leading-relaxed">
              Instant WebAssembly speed for sensitive financial & legal documents.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-emerald-950">Free & Unlimited</h4>
            <p className="text-xs text-emerald-800/80 mt-0.5 leading-relaxed">
              No file size caps, zero queue delays, and zero subscription fees.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
