import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 mt-24">
      <div className="container-system py-16 grid md:grid-cols-3 gap-12 text-sm">

        <div>
          <p className="font-semibold mb-3">Printing Muse</p>
          <p className="text-neutral-500">
            Playful 3D printed objects crafted with imagination.
          </p>
        </div>

        <div>
          <p className="font-semibold mb-3">Explore</p>
          <div className="space-y-2 text-neutral-500">
            <Link href="/products">All Products</Link><br/>
            <Link href="/products?category=custom">Custom Lab</Link>
          </div>
        </div>

        <div>
          <p className="font-semibold mb-3">Connect</p>
          <div className="space-y-2 text-neutral-500">
            <p>Instagram</p>
            <p>Email</p>
          </div>
        </div>

      </div>
    </footer>
  );
}