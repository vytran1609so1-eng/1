import "./globals.css";
import SiteProvider from "@/components/SiteProvider";
import SmoothScroll from "@/components/SmoothScroll";
import Cursor from "@/components/Cursor";
import Nav from "@/components/Nav";
import EditPanel from "@/components/EditPanel";
import { Analytics } from "@vercel/analytics/next";
import { getSettings } from "@/lib/data";

export const metadata = {
  // TODO: change to your real domain once you have one
  metadataBase: new URL("https://example.com"),
  title: {
    default: "Tran Thi Thuy Vy — Fintech Portfolio",
    template: "%s · Tran Thi Thuy Vy",
  },
  description:
    "Financial Technology undergraduate at the University of Economics and Law (VNU-HCM). Academic work, professional experience, leadership and extracurricular projects.",
  keywords: [
    "Tran Thi Thuy Vy",
    "Fintech",
    "Portfolio",
    "UEL",
    "Financial Technology",
    "Consulting",
  ],
  openGraph: {
    title: "Tran Thi Thuy Vy — Fintech Portfolio",
    description:
      "I turn ambition into numbers that hold up. Academic work, experience, leadership and extracurricular projects.",
    type: "website",
  },
};

export const viewport = { themeColor: "#FCFDFF" };

export default async function RootLayout({ children }) {
  const settings = await getSettings();

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Ephesis&family=Great+Vibes&family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SiteProvider serverImages={settings.resolvedImages} serverUi={settings.ui}>
          <SmoothScroll enabled={settings.motion?.smoothScroll !== false} />
          <Cursor enabled={settings.motion?.cursor !== false} />
          <Nav signature={settings.profile.signature} />
          {children}
          <EditPanel />
        </SiteProvider>
        {/* Vercel Web Analytics — how many people visit, and which pages they
            read. No cookies, no personal data. Switch it on once in Vercel:
            project → Analytics → Enable. */}
        <Analytics />
      </body>
    </html>
  );
}
