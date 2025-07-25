
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does the AI recommend wines for my meal or mood?",
    answer: "Our AI analyzes your meal description, dietary preferences, budget, and past ratings to suggest wines from the restaurant's actual wine list. It considers flavor profiles, wine characteristics, and traditional pairing principles to make personalized recommendations."
  },
  {
    question: "Can I find wines within my budget?",
    answer: "Absolutely! You can set your preferred price range, and our AI will only recommend wines within your budget. We believe great wine pairings shouldn't break the bank."
  },
  {
    question: "What if I don't like the recommendations?",
    answer: "Simply rate the wine after trying it! Our AI learns from your feedback and gets better at understanding your preferences over time. You can also specify what you didn't like to improve future suggestions."
  },
  {
    question: "Is this good for beginners?",
    answer: "Perfect for beginners! We explain wine pairings in simple, jargon-free language and include educational notes about why certain pairings work. You'll learn as you explore."
  },
  {
    question: "How fast will I get suggestions?",
    answer: "Instantly! Once you input your meal and preferences, our AI provides recommendations in seconds. No more waiting or awkward conversations with busy servers."
  },
  {
    question: "Can it help me choose premium wines?",
    answer: "Yes! Whether you're looking for an everyday bottle or a special occasion wine, our AI can recommend premium options that pair perfectly with your meal and justify the investment."
  }
];

const FAQSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-slate-600">
            Everything you need to know about Wine-Wize
          </p>
        </div>
        
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-200 px-6"
            >
              <AccordionTrigger className="text-left text-lg font-semibold text-slate-800 hover:text-purple-600 transition-colors py-6">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 leading-relaxed pb-6">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
