import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ShieldCheck, Zap } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'How does client-side PDF compression work?',
    answer:
      'PDFCompress Pure processes your files entirely inside your web browser using HTML5 Canvas and JavaScript/WebAssembly PDF libraries. It identifies embedded high-resolution images, re-samples them to optimal target resolutions, strips redundant metadata streams, and re-compresses object tables locally on your computer.',
  },
  {
    question: 'Are my confidential documents safe?',
    answer:
      '100% yes. Unlike traditional online PDF tools that require uploading your sensitive files to cloud servers, this tool executes all processing on your local CPU. Your file never crosses the internet or touches a remote disk.',
  },
  {
    question: 'Will compression degrade my PDF text quality?',
    answer:
      'No! Vector text, fonts, geometric lines, and form fields remain crisp and sharp. Compression focuses on down-sampling high-DPI embedded photographs and raster images, as well as clearing unnecessary object streams.',
  },
  {
    question: 'Is there any file size limit or fee?',
    answer:
      'No limits and 100% free forever. Since the heavy compute lifting happens on your device rather than paid cloud servers, you can compress files of any size without restrictions or subscriptions.',
  },
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full max-w-3xl mx-auto pt-6 border-t border-stone-200">
      <div className="text-center mb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 flex items-center justify-center gap-1">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Frequently Asked Questions</span>
        </span>
        <h3 className="text-xl font-bold text-stone-900 mt-1">Everything You Need To Know</h3>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs transition-all"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full px-5 py-4 text-left font-semibold text-sm text-stone-900 flex items-center justify-between gap-4 hover:text-emerald-700 transition-colors"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`w-4 h-4 text-emerald-600 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-4 text-xs text-stone-600 leading-relaxed border-t border-stone-100 pt-3 bg-stone-50/50">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
