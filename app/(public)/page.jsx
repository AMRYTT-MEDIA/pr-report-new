import { redirect } from "next/navigation";

export default function HomePage() {
  // Simple server-side redirect
  redirect("/login");
}
