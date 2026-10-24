
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { ChaosBackground } from "@/ui/ChaosBackground";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = "https://YOUR-DOMAIN.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "VibeCheck — Personality Quizzes & Friend Challenges",
    template: "%s | VibeCheck",
  },

  description:
    "Discover your vibe, test your friendships, and bring chaos to the group chat. Create fun personality quizzes and shareable challenges with VibeCheck.",

  applicationName: "VibeCheck",

  keywords: [
    "VibeCheck",
    "personality quizzes",
    "friendship quizzes",
    "online personality test",
    "who knows me best quiz",
    "group chat challenges",
    "fun quizzes for friends",
    "shareable quizzes",
    "friend group games",
  ],

  category: "entertainment",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    url: "/",
    siteName: "VibeCheck",
    title: "VibeCheck — Find Your Vibe. Expose Your Friends.",
    description:
      "Take personality quizzes, challenge your besties, and discover who really knows you. Your group chat will never be the same.",
    locale: "en_US",
  },

  twitter: {
    card: "summary_large_image",
    title: "VibeCheck — Find Your Vibe. Expose Your Friends.",
    description:
      "Personality quizzes, friendship tests, and group-chat chaos. Pick a challenge and put your friends to the test.",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <ChaosBackground />
      <body className="min-h-full flex flex-col">
        {children}
      </body>
      <MobileBottomNav />
    </html>
  );
}
