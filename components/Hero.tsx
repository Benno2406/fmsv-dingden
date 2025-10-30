import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1642099415153-e5a9692a77f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2RlbCUyMGFpcmNyYWZ0JTIwZmx5aW5nfGVufDF8fHx8MTc2MTE2MzUyMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    alt: "Modellflugzeug in der Luft"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1759072865254-d4e9b204d291?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYyUyMGdsaWRlciUyMGFpcmNyYWZ0fGVufDF8fHx8MTc2MTE2NDk0MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    alt: "RC Segelflugzeug"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1626020628008-e05290afad21?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkcm9uZSUyMHF1YWRjb3B0ZXIlMjBmbHlpbmd8ZW58MXx8fHwxNzYxMTY0OTQxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    alt: "Multikopter Drohne"
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1688448687348-b464f836a200?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYyUyMHBsYW5lJTIwYWlyZmllbGR8ZW58MXx8fHwxNzYxMTY0OTQxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    alt: "Flugplatz mit RC Modellen"
  }
];

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000); // Change slide every 8 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  return (
    <section className="relative h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
            index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <ImageWithFallback
            src={slide.image}
            alt={slide.alt}
            className="w-full h-full object-cover"
          />
          {/* Subtle vignette effect for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/10 pointer-events-none"></div>
        </div>
      ))}

      {/* Navigation Arrows - smaller and more subtle */}
      <button
        onClick={prevSlide}
        className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 z-10 bg-white/5 hover:bg-white/15 text-white p-1.5 md:p-2 rounded-full backdrop-blur-sm transition-all border border-white/10 opacity-60 hover:opacity-100"
        aria-label="Vorheriges Slide"
      >
        <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 z-10 bg-white/5 hover:bg-white/15 text-white p-1.5 md:p-2 rounded-full backdrop-blur-sm transition-all border border-white/10 opacity-60 hover:opacity-100"
        aria-label="Nächstes Slide"
      >
        <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
      </button>

      {/* Dots Navigation - smaller and more subtle */}
      <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-1.5 rounded-full transition-all ${
              index === currentSlide
                ? "bg-white w-8 opacity-90"
                : "bg-white/40 hover:bg-white/60 w-1.5 opacity-70"
            }`}
            aria-label={`Gehe zu Slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
