import Link from "next/link";
import Image from "next/image";

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

          <Link href="/products" className="btn-primary">
            Explore
          </Link>
        </div>

        <div className="relative rounded-xl overflow-hidden h-[360px]">
          <Image
            src="/hero.png"
            alt="Hero"
            fill
            className="object-cover"
            priority
          />
        </div>

      </div>
    </section>
  );
}