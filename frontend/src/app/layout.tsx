import "./globals.css";
import { Space_Grotesk, Inter } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/CartDrawer";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import { ToastProvider } from "@/hooks/useToast";

const space = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${space.variable} ${inter.variable}`}
    >
      <head>
        <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      </head>
      <body className="font-[var(--font-inter)]">

        <AuthProvider>
          <ToastProvider>
          <CartProvider>

            <Navbar />
            <CartDrawer />

            <main className="min-h-screen">
              {children}
            </main>

            <Footer />

          </CartProvider>
          </ToastProvider>
        </AuthProvider>

      </body>
    </html>
  );
}