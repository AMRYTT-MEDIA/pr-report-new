import UserTable from "@/components/users/UserTable";

// Force dynamic rendering to prevent prerender errors
export const dynamic = "force-dynamic";

export default function UsersPage() {
  return <UserTable />;
}
