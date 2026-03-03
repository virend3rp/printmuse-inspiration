import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import Categories from "@/components/sections/Categories";
import Featured from "@/components/sections/Featured";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Categories />
      <Featured />
      <Footer />
    </>
  );
}