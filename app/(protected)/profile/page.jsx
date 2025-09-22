import ProfileForm from "@/components/profile/ProfileForm";

export const metadata = {
  title: "Profile",
  description:
    "Manage your profile settings and account information. Update your personal details and preferences.",
};

/**
 * Profile Page Component - Server Side
 * All client-side logic is handled in the ProfileForm component
 */
export default function ProfilePage() {
  return (
    <div>
      <ProfileForm />
    </div>
  );
}
