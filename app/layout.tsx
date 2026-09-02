import type { Metadata } from "next";
import "./globals.css";
import { meta } from "./lib/content";

export const metadata: Metadata = {
  metadataBase: new URL(meta.url),
  title: meta.title,
  description: meta.description,
  authors: [{ name: meta.author, url: meta.url }],
  creator: meta.author,
  keywords: meta.keywords,
  alternates: { canonical: meta.url },
  openGraph: {
    title: meta.title,
    description: meta.description,
    url: meta.url,
    siteName: meta.siteName,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: meta.ogImage,
        width: 1200,
        height: 630,
        alt: "Anthony MAHEFA Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    creator: meta.twitterCreator,
    title: meta.title,
    description: meta.description,
    images: [meta.ogImage],
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "256x256", type: "image/x-icon" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var stored=localStorage.getItem('ui-theme');var t=stored==='light'?'light':'dark';document.documentElement.classList.remove('light','dark');document.documentElement.classList.add(t);}catch(e){document.documentElement.classList.add('dark');}})();`,
          }}
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
