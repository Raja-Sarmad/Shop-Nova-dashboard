import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Shop Nova Admin",
    template: "%s · Shop Nova Admin",
  },
  description: "Shop Nova ecommerce admin dashboard",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} h-full antialiased`}>
      <body className="min-h-full bg-bg font-sans text-ink">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
