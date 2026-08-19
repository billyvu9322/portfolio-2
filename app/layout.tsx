import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://thony32.tech"),
  title: "Anthony MAHEFA | Portfolio",
  description:
    "MAHEFASOA Ny Riana Anthony (Hydra) - Portfolio as a Fullstack Developer and DevOps Engineer.",
  authors: [{ name: "Anthony MAHEFA", url: "https://thony32.tech" }],
  creator: "Anthony MAHEFA",
  keywords: [
    "MAHEFA",
    "Ny Riana",
    "Anthony",
    "Hydra",
    "Developer",
    "DevOps",
    "Portfolio",
    "Fullstack",
    "Engineer",
  ],
  alternates: { canonical: "https://thony32.tech" },
  openGraph: {
    title: "Anthony MAHEFA | Portfolio",
    description:
      "MAHEFASOA Ny Riana Anthony (Hydra) - Portfolio as a Fullstack Developer and DevOps Engineer.",
    url: "https://thony32.tech",
    siteName: "Anthony's Portfolio",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://thony32.tech/images/Anthony.svg",
        width: 1200,
        height: 630,
        alt: "Anthony MAHEFA Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@akahydra32",
    title: "Anthony MAHEFA | Portfolio",
    description:
      "MAHEFASOA Ny Riana Anthony (Hydra) - Portfolio as a Fullstack Developer and DevOps Engineer.",
    images: ["https://thony32.tech/images/Anthony.svg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "256x256", type: "image/x-icon" },
      { url: "/images/Anthony.svg" },
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
            __html: `(function(){try{var t=localStorage.getItem('ui-theme')||'dark';document.documentElement.classList.remove('light','dark');document.documentElement.classList.add(t);}catch(e){document.documentElement.classList.add('dark');}})();`,
          }}
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
