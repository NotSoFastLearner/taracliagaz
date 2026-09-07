import { useState, useEffect } from "react";

interface Slide {
  title: string;
  text: string;
  imageUrl: string;
}

const slides: Slide[] = [
  {
    title: "Экология",
    text: "АО «Молдовагаз» реализует модернизацию оборудования с целью сокращения выбросов метана в атмосферу.",
    imageUrl: "/images/slider/ecology.jpg",
  },
  {
    title: "Природный газ",
    text: "В Республике Молдова природный газ используется в топливно-энергетическом комплексе, промышленном и коммунально-бытовом секторах.",
    imageUrl: "/images/slider/gas.jpg",
  },
  {
    title: "Использование природного газа",
    text: "Как более чистый вид топлива, природный газ помогает достичь экологического эффекта и решить проблемы энергообеспеченности страны.",
    imageUrl: "/images/slider/usage.jpg",
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((current - 1 + slides.length) % slides.length);
  const next = () => setCurrent((current + 1) % slides.length);

  return (
    <section className="hero-slider" aria-label="Слайдер">
      {slides.map((slide, index) => (
        <div
          key={slide.title}
          className={`slide${index === current ? " active" : ""}`}
          style={{ backgroundImage: `url(${slide.imageUrl})` }}
        >
          <div className="slide-overlay" />
          <div className="container slide-content">
            <h2>{slide.title}</h2>
            <p>{slide.text}</p>
          </div>
        </div>
      ))}
      <button className="slider-btn prev" onClick={prev} aria-label="Предыдущий слайд">
        ‹
      </button>
      <button className="slider-btn next" onClick={next} aria-label="Следующий слайд">
        ›
      </button>
      <div className="slider-dots">
        {slides.map((_, index) => (
          <button
            key={index}
            className={index === current ? "active" : ""}
            onClick={() => setCurrent(index)}
            aria-label={`Слайд ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
