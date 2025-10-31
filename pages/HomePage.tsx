import { Hero } from "../components/Hero";
import { AboutSection } from "../components/AboutSection";
import { DepartmentsSection } from "../components/DepartmentsSection";
import { NewsSection } from "../components/NewsSection";

export function HomePage() {
  return (
    <>
      <Hero />
      <AboutSection />
      <DepartmentsSection />
      <NewsSection />
    </>
  );
}
