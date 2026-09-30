import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { AppDataProvider } from "@/lib/useAppData";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { TopNavLinks, BottomNavLinks } from "@/components/nav/NavLinks";

const isGithubPages = process.env.GITHUB_PAGES === "true";
const basePath = isGithubPages ? "/pulso" : "";

export const metadata: Metadata = {
  title: "Pulso",
  description: "Sueño, piel, dieta y un hábito a tu elección: registra cada día y mira tu evolución mensual.",
  icons: {
    icon: `${basePath}/icon-192.png`,
    apple: `${basePath}/apple-touch-icon.png`,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#14b8a6",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-950 pb-20 text-white antialiased sm:pb-0">
        <AppDataProvider>
          <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
            <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
              <Link href="/" className="flex items-center gap-2 font-bold">
                <span>💚</span> Pulso
              </Link>
              <TopNavLinks />
            </div>
          </header>

          <div className="mx-auto max-w-3xl px-4 py-6">{children}</div>

          <BottomNavLinks />
          <ServiceWorkerRegister />
        </AppDataProvider>
      </body>
    </html>
  );
}
