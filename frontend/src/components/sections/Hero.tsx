import Link from "next/link";

export default function Hero() {
  return (
    <section className="section-system bg-white">
      <div className="container-system grid md:grid-cols-2 gap-12 items-center">

        <div>
          <h1 className="heading-xl mb-3">
            Digital →
            <br />
            Physical.
          </h1>

          <p className="text-body text-muted mb-6 max-w-md">
            Playful 3D printed objects crafted
            with imagination and precision.
          </p>

          <div className="flex gap-3">
            <Link href="/products" className="btn-primary">
              Explore
            </Link>

            <Link href="/products?category=custom" className="btn-outline">
              Custom Lab
            </Link>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden">
          <img
            src="/hero.png"
            className="w-full h-[360px] object-cover"
          />
        </div>

      </div>
    </section>
  );
}