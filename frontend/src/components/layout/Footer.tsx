import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 mt-24 bg-white">

      <div className="max-w-7xl mx-auto px-6 py-20">

        <div className="grid md:grid-cols-4 gap-12 text-sm">

          {/* Brand */}
          <div>
            <h3 className="font-semibold text-base mb-4">
              PrintingMuse
            </h3>

            <p className="text-neutral-500 leading-relaxed">
              Playful 3D printed creations crafted with
              imagination. Designed for collectors,
              hobbyists, and curious minds.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-semibold mb-4">
              Explore
            </h4>

            <div className="flex flex-col gap-2 text-neutral-600">
              <Link
                href="/products"
                className="hover:text-black"
              >
                All Products
              </Link>

              <Link
                href="/category/keychains"
                className="hover:text-black"
              >
                Keychains
              </Link>

              <Link
                href="/category/figurines"
                className="hover:text-black"
              >
                Figurines
              </Link>

              <Link
                href="/category/utility"
                className="hover:text-black"
              >
                Utility
              </Link>
            </div>
          </div>

          {/* Custom */}
          <div>
            <h4 className="font-semibold mb-4">
              Custom Lab
            </h4>

            <div className="flex flex-col gap-2 text-neutral-600">
              <Link
                href="/products?category=custom"
                className="hover:text-black"
              >
                Custom Orders
              </Link>

              <Link
                href="/custom"
                className="hover:text-black"
              >
                Upload Design
              </Link>

              <Link
                href="/contact"
                className="hover:text-black"
              >
                Request Quote
              </Link>
            </div>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-semibold mb-4">
              Connect
            </h4>

            <div className="flex flex-col gap-2 text-neutral-600">
              <a
                href="https://instagram.com"
                target="_blank"
                className="hover:text-black"
              >
                Instagram
              </a>

              <a
                href="mailto:hello@printingmuse.com"
                className="hover:text-black"
              >
                Email
              </a>
            </div>
          </div>

        </div>

        {/* Bottom bar */}

        <div className="border-t border-neutral-200 mt-16 pt-6 text-sm text-neutral-500 flex flex-col md:flex-row justify-between gap-4">

          <p>
            © {new Date().getFullYear()} PrintingMuse.
            All rights reserved.
          </p>

          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-black">
              Privacy
            </Link>

            <Link href="/terms" className="hover:text-black">
              Terms
            </Link>
          </div>

        </div>

      </div>

    </footer>
  )
}