import { Inter } from "next/font/google";
import { AuthProvider } from "./components/AuthProvider";
import Sidebar from "./components/Sidebar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  title: {
    default: "LUMA — Discover Great Cinema",
    template: "%s | LUMA",
  },
  description:
    "LUMA is a premium movie discovery platform. Explore trending films, top-rated classics, and hidden gems.",
  keywords: ["movies", "cinema", "film discovery", "trending movies", "top rated films"],
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "LUMA — Discover Great Cinema",
    description: "A premium movie discovery platform for cinema lovers.",
    siteName: "LUMA",
  },
  twitter: {
    card: "summary_large_image",
    title: "LUMA — Discover Great Cinema",
    description: "A premium movie discovery platform for cinema lovers.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={inter.variable}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body>
        <AuthProvider>
          <div className="app-shell">
            <Sidebar />
            <div className="app-main">
              {children}
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}