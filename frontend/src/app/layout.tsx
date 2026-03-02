import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-neutral-100">
        <Providers>
          <Navbar />
          {children}
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}