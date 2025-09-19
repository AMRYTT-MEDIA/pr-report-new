import "./globals.css";
import { Inter } from "next/font/google";
import { ClientProviders } from "@/components/ClientProviders";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: {
    template: "%s | PR Reports",
    default: "PR Reports",
  },
  description:
    "PR Reports distribution platform. Manage your PR campaigns, track distribution metrics, and analyze reach across multiple media outlets.",
  keywords: [
    "PR Reports",
    "PR distribution",
    "press release",
    "media outreach",
    "public relations",
    "press coverage",
  ],
  authors: [{ name: "PR Reports Team" }],
  creator: "PR Reports",
  publisher: "PR Reports",
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
