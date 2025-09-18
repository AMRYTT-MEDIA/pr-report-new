import "./globals.css";
import { Inter } from "next/font/google";
import { ClientProviders } from "@/components/ClientProviders";
import { APP_CONFIG } from "@/constants/index.js";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: APP_CONFIG.title,
  description: APP_CONFIG.description,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
