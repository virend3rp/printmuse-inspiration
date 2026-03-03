import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b border-neutral-200">
      <div className="container-system flex items-center justify-between h-16">

        <Link href="/" className="text-lg font-extrabold tracking-tight">
          PrintingMuse
        </Link>

        <nav className="hidden md:flex gap-6 text-sm font-medium">
          <Link href="/products">Shop</Link>
          <Link href="/products?category=figurines">Figurines</Link>
          <Link href="/products?category=utility">Utility</Link>
          <Link href="/products?category=keychains">Keychains</Link>
        </nav>

        <div className="flex gap-6 text-sm">
          <Link href="/login">Login</Link>
          <Link href="/cart">Cart</Link>
        </div>

      </div>
    </header>
  );
}