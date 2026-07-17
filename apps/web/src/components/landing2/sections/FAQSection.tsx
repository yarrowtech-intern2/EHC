"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { FadeIn } from "../common/FadeIn";
import { EditorialHighlight, EditorialTitle } from "../common/EditorialTitle";
import { faqData } from "@/data/landing2-faq";

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 sm:py-28 px-5 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <FadeIn className="text-center mb-12">
          <EditorialTitle
            as="h2"
            size="section"
            lines={[<EditorialHighlight key="faq">FAQ</EditorialHighlight>]}
          />
        </FadeIn>

        <div className="divide-y divide-gray-100">
          {faqData.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i}>
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex items-start justify-between w-full text-left py-5 gap-4"
                  aria-expanded={isOpen}
                  aria-controls={`faq2-${i}`}
                >
                  <span className="text-[15px] font-medium text-primary-text">
                    {item.question}
                  </span>
                  <span className="shrink-0 mt-0.5">
                    {isOpen ? (
                      <Minus className="w-4 h-4 text-brand" />
                    ) : (
                      <Plus className="w-4 h-4 text-secondary-text" />
                    )}
                  </span>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      id={`faq2-${i}`}
                      role="region"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 text-[14px] text-secondary-text leading-relaxed pr-8">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
