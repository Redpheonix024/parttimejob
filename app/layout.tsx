import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import AuthProvider from "../components/auth/auth-provider";
import ServiceWorkerRegister from "@/components/service-worker-register";
import DevSWDebug from "@/components/dev-sw-debug";

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-poppins',
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title: "Parttimejob - Find Part-Time Jobs",
  description:
    "Connect with local part-time opportunities or find qualified people for your short-term tasks.",
  generator: "v0.dev",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Parttimejob",
  },
  icons: {
    icon: [
      { url: "/icons/PTJ SVG.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  applicationName: "Parttimejob",
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Parttimejob",
    title: "Parttimejob - Find Part-Time Jobs",
    description:
      "Connect with local part-time opportunities or find qualified people for your short-term tasks.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={poppins.className}>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>{children}</AuthProvider>
          <ServiceWorkerRegister />
          <DevSWDebug />
        </ThemeProvider>
      </body>
    </html>
  );
}
