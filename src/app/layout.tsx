import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: '%s | TK Stories',
    default: 'TK Stories - Discover Amazing Stories'
  },
  description: "Discover and share amazing stories from our community. Read engaging content and publish your own stories with our rich text editor.",
  keywords: ["stories", "blog", "writing", "community", "articles"],
  authors: [{ name: "TK Stories Team" }],
  creator: "TK Stories",
  publisher: "TK Stories",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL?.startsWith('http') 
      ? process.env.NEXT_PUBLIC_BASE_URL 
      : `https://${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}`
  ),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'TK Stories',
    title: 'TK Stories - Discover Amazing Stories',
    description: 'Discover and share amazing stories from our community.',
    images: [
      {
        url: '/og-image.jpg', // You'll need to create this
        width: 1200,
        height: 630,
        alt: 'TK Stories'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TK Stories - Discover Amazing Stories',
    description: 'Discover and share amazing stories from our community.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
