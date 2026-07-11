import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import ScrollStory from "@/components/ScrollStory";
import MenuSection from "@/components/MenuSection";
import Showcase from "@/components/Showcase";
import LocationSection from "@/components/LocationSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <ScrollStory />
        <MenuSection />
        <Showcase />
        <LocationSection />
        <Footer />
      </main>
    </>
  );
}
