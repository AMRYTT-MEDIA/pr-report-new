import UserTable from "@/components/users/UserTable";

// Force dynamic rendering to prevent prerender errors
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Users",
  description:
    "Manage user accounts and permissions. Add, edit, and control access for your PR Reports platform users.",
};

export default function UsersPage() {
  return <UserTable />;
}
