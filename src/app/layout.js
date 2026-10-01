import { AuthProvider } from "./components/AuthProvider";
import { ThemeProvider } from "./components/ThemeProvider";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import "./globals.css";

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
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => { try { var t = localStorage.getItem('luma-theme'); if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t); } catch (e) {} })();`,
          }}
        />
        <AuthProvider>
          <ThemeProvider>
            <div className="app-shell">
              <Sidebar />
              <div className="app-main">
                <TopBar />
                {children}
              </div>
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}