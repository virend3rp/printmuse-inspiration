import Link from "next/link"

const footerLink = "text-neutral-400 hover:text-white transition-colors duration-200"

export default function Footer() {
  return (
    <footer className="bg-neutral-950 text-white mt-24">

      <div className="max-w-7xl mx-auto px-6 py-16">

        <div className="grid md:grid-cols-3 gap-12 text-sm">

          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-lg tracking-tight">Forgecraft</h3>
            <p className="text-neutral-400 leading-relaxed text-[13px]">
              Custom 3D printed creations forged with precision.
              Designed for collectors, hobbyists, and curious minds.
            </p>
            {/* Social icons */}
            <div className="flex gap-3 pt-1">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-white hover:text-black transition-colors duration-200 flex items-center justify-center"
                aria-label="Instagram"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a
                href="mailto:hello@forgecraft.com"
                className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-white hover:text-black transition-colors duration-200 flex items-center justify-center"
                aria-label="Email"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-xs uppercase tracking-widest">
              Explore
            </h4>
            <div className="flex flex-col gap-2.5">
              <Link href="/products/keychains" className={footerLink}>Keychains</Link>
              <Link href="/products/figurines" className={footerLink}>Figurines</Link>
              <Link href="/products/utility"   className={footerLink}>Utility</Link>
            </div>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-xs uppercase tracking-widest">
              Account
            </h4>
            <div className="flex flex-col gap-2.5">
              <Link href="/login"  className={footerLink}>Login</Link>
              <Link href="/orders" className={footerLink}>My Orders</Link>
              <a href="mailto:hello@forgecraft.com" className={footerLink}>Support</a>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-neutral-800 mt-12 pt-6 text-xs text-neutral-500 flex flex-col md:flex-row justify-between gap-3">
          <p>© {new Date().getFullYear()} Forgecraft. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-white transition-colors duration-200">Privacy</Link>
            <Link href="/terms"   className="hover:text-white transition-colors duration-200">Terms</Link>
          </div>
        </div>

      </div>

    </footer>
  )
}
