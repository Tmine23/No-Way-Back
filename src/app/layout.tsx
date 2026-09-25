import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import { MotionProvider } from "@/components/motion-provider";
import { ServiceWorkerRegistrar } from "@/components/service-worker-registrar";
import "./globals.css";

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "No Way Back",
  description: "Guild hub de No Way Back: raids, roster, loot y reclutamiento.",
  applicationName: "No Way Back",
  appleWebApp: {
    capable: true,
    title: "No Way Back",
    statusBarStyle: "black-translucent",
  },
  icons: {
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#101422",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${barlow.variable} ${barlowCondensed.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <MotionProvider>{children}</MotionProvider>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
