import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./hooks/useAuth";
import { RightPanelProvider } from "./contexts/RightPanelContext";
import AppShell from "./components/AppShell";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata = {
  title: "DevMatch AI | Intelligent Teammate Finder",
  description: "Find the perfect teammates for your next hackathon using AI-powered skill matching and vector similarity.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased selection:bg-[#f9ae9b]/30">
        <AuthProvider>
          <RightPanelProvider>
            {/* Ambient background glow applied globally */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[600px] opacity-30 pointer-events-none z-0">
              <div className="absolute inset-0 bg-gradient-to-b from-[#f9ae9b]/20 via-[#fac2b4]/10 to-transparent blur-[100px] rounded-full"></div>
            </div>
            
            <AppShell>{children}</AppShell>
            
          </RightPanelProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
