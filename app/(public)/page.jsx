import { redirect } from "next/navigation";

export default function HomePage() {
  // This ensures proper routing in production
  redirect("/login");
}

// Add metadata for better SEO
export const metadata = {
  title: "GuestPostLinks PR Boost - Redirecting to Login",
  description: "Redirecting to login page",
};
