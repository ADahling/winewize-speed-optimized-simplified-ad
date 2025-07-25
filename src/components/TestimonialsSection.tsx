
import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const testimonials = [
  {
    name: "Jess",
    location: "NYC",
    avatar: "J",
    quote: "I used to panic over 40-page wine lists — now I order in under a minute.",
    rating: 5
  },
  {
    name: "Marco",
    location: "Chicago",
    avatar: "M", 
    quote: "I finally feel like I get wine. This app just gets it right.",
    rating: 5
  },
  {
    name: "Priya",
    location: "San Francisco",
    avatar: "P",
    quote: "Made a date night dinner feel like a 5-star experience.",
    rating: 5
  }
];

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      }, 4000);
      
      return () => clearInterval(interval);
    }
  }, [isMobile]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section 
      className="py-20 bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: 'url(/lovable-uploads/34a7340c-bf54-49f7-ad9c-8d0a86432583.png)'
      }}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="text-purple-200 font-semibold text-sm uppercase tracking-wide">
            Customer Love
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-4 mb-6">
            What Our <span className="bg-gradient-to-r from-amber-300 to-yellow-200 bg-clip-text text-transparent">Sippers</span> Say
          </h2>
        </div>
        
        {/* Mobile Carousel */}
        <div className="md:hidden">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 border border-white/30 shadow-xl mx-4">
            <div className="flex items-center gap-1 mb-6">
              {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
              ))}
            </div>
            
            <blockquote className="text-slate-700 text-lg leading-relaxed mb-8 italic">
              "{testimonials[currentIndex].quote}"
            </blockquote>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                {testimonials[currentIndex].avatar}
              </div>
              <div>
                <div className="text-slate-800 font-semibold">
                  {testimonials[currentIndex].name}
                </div>
                <div className="text-slate-600 text-sm">
                  {testimonials[currentIndex].location}
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile indicators */}
          <div className="flex justify-center mt-6 gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </div>

        {/* Desktop Grid with Manual Navigation */}
        <div className="hidden md:block relative">
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 border border-white/30 hover:bg-white/100 transition-all duration-300 shadow-xl"
              >
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
                  ))}
                </div>
                
                <blockquote className="text-slate-700 text-lg leading-relaxed mb-8 italic">
                  "{testimonial.quote}"
                </blockquote>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="text-slate-800 font-semibold">
                      {testimonial.name}
                    </div>
                    <div className="text-slate-600 text-sm">
                      {testimonial.location}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Desktop Navigation Arrows */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border-white/50"
            onClick={prevTestimonial}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border-white/50"
            onClick={nextTestimonial}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
