import Link from "next/link";
import Container from "../ui/Container";
import Section from "../ui/Section";

const categories = [
  { title: "Keychains", href: "/products?category=keychains", img: "/keychains.jpg" },
  { title: "Figurines", href: "/products?category=figurines", img: "/figurines.png" },
  { title: "Utility", href: "/products?category=utility", img: "/utility.png" },
  { title: "Custom", href: "/products?category=custom", img: "/custom-print.png" },
];

export default function Categories() {
  return (
<section className="section-system bg-neutral-50">
  <div className="container-system">

    <h2 className="heading-lg mb-8">
      Categories
    </h2>

    <div className="grid md:grid-cols-2 gap-6">
      {categories.map((cat) => (
        <Link
          key={cat.title}
          href={cat.href}
          className="relative overflow-hidden rounded-xl group"
        >
          <img
            src={cat.img}
            className="w-full h-[300px] object-cover group-hover:scale-105 transition duration-500"
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute bottom-4 left-4 text-white font-semibold text-lg">
            {cat.title}
          </div>
        </Link>
      ))}
    </div>

  </div>
</section>
  );
}