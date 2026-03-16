import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="section-system" style={{ background: "var(--color-surface)" }}>
      <div className="container-system grid md:grid-cols-2 gap-12 items-center">

        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--color-accent)" }}>
            Custom 3D Print Shop
          </p>

          <h1 className="heading-xl mb-4">
            <span className="forge-title">Forged.</span>
            <br />
            Not Printed.
          </h1>

          <p className="text-body mb-8 max-w-md" style={{ color: "var(--color-text-secondary)" }}>
            Every piece is precision-crafted from raw filament into something
            real. Keychains, figurines, utility objects — made to order.
          </p>

          <Link href="/products/keychains" className="btn-primary">
            Explore Collection
          </Link>
        </div>

        <div className="relative rounded-2xl overflow-hidden h-[380px]" style={{ background: "var(--color-surface-2)" }}>
          <Image
            src={`${process.env.NEXT_PUBLIC_S3_BASE_URL}/hero.png`}
            alt="Forgecraft products"
            fill
            className="object-cover"
            priority
          />
          {/* forge amber edge glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(135deg, rgba(245,166,35,0.08) 0%, transparent 60%)",
            }}
          />
        </div>

      </div>
    </section>
  );
}
