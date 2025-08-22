import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth";
import tokenManager from "@/lib/tokenManager";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "GuestPostLinks PR Boost",
  description: "Professional PR distribution and reporting platform",
};

export default function RootLayout({ children }) {
  // Initialize global token management
  if (typeof window !== "undefined") {
    tokenManager.initializeTokenManager().catch(console.error);
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
