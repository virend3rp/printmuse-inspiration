import Link from "next/link";
import Image from "next/image";

const categories = [
  { title: "Keychains", href: "/products/keychains", img: "/keychains.jpg" },
  { title: "Figurines", href: "/products/figurines", img: "/figurines.png" },
  { title: "Utility", href: "/products/utility", img: "/utility.png" },
  { title: "Custom", href: "/products/custom", img: "/utility.png" },
];

export default function Categories() {
  return (
    <section className="section-system">
      <div className="container-system">

        <h2 className="heading-lg mb-8" style={{ color: "var(--color-text-primary)" }}>
          Categories
        </h2>

        <div className="grid md:grid-cols-2 gap-5">
          {categories.map((cat) => (
            <Link
              key={cat.title}
              href={cat.href}
              className="relative overflow-hidden rounded-2xl group h-[280px] block"
              style={{ background: "var(--color-surface-2)" }}
            >
              <Image
                src={cat.img}
                alt={cat.title}
                fill
                className="object-cover group-hover:scale-105 transition duration-500 opacity-70 group-hover:opacity-60"
              />
              {/* dark base overlay */}
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(14,12,10,0.85) 0%, rgba(14,12,10,0.2) 60%)" }} />
              {/* forge amber edge on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ boxShadow: "inset 0 0 0 2px var(--color-forge-dim)" }}
              />
              <div className="absolute bottom-5 left-5">
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--color-accent)" }}>
                  Shop
                </p>
                <p className="text-white font-bold text-xl">{cat.title}</p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
