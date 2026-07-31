import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ShieldCheck, Zap } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'How does client-side multi-format compression work?',
    answer:
      'FileShrink AI processes your files entirely inside your web browser using HTML5 Canvas, PDF rendering streams, and ZIP document decoders. It downsamples high-resolution embedded images, optimizes document object streams, and re-encodes pixel streams locally on your computer.',
  },
  {
    question: 'What file formats can I compress?',
    answer:
      'FileShrink AI supports PDF documents, image files (JPG, JPEG, PNG, WebP), and Word documents (.docx). You can drop single files or mix different file types together in a simultaneous batch queue.',
  },
  {
    question: 'Are my confidential documents safe?',
    answer:
      '100% yes. Unlike traditional online converters that require uploading your sensitive files to cloud servers, FileShrink AI executes all processing on your local device CPU. Your files never cross the internet or touch a remote disk.',
  },
  {
    question: 'Will compression degrade text or formatting?',
    answer:
      'No! Vector text, fonts, geometric lines, and Word document text structures remain sharp. Compression intelligently targets embedded high-DPI raster images and unnecessary metadata streams.',
  },
  {
    question: 'Is there any file size limit or fee?',
    answer:
      'No limits and 100% free forever. Since computation happens directly in your browser rather than on paid cloud servers, you can compress files of any size without restrictions or subscriptions.',
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
