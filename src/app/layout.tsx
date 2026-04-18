import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { PWARegister } from "@/components/PWARegister";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Meu Controle",
  description: "Painel interno de gestão, operação e acompanhamento do negócio.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Meu Controle",
  },
  icons: {
    icon: "/mascote.png",
    apple: "/mascote.png",
  },
  openGraph: {
    title: "Meu Controle",
    description: "Painel interno de gestão, operação e acompanhamento do negócio.",
    images: [{ url: "/mascote.png", width: 512, height: 512, alt: "Meu Controle" }],
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary",
    title: "Meu Controle",
    description: "Painel interno de gestão, operação e acompanhamento do negócio.",
    images: ["/mascote.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${outfit.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground antialiased transition-colors">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
          <Toaster richColors position="top-right" />
          <PWARegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
