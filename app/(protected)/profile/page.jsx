import ProfileForm from "@/components/profile/ProfileForm";

export const metadata = {
  title: "Profile",
  description: "Manage your profile settings and account information. Update your personal details and preferences.",
};

export default function ProfilePage() {
  return (
    <div className="fixed inset-0 bg-slate-50 overflow-y-auto pt-14 lg:left-[250px] ">
      <ProfileForm />
    </div>
  );
}
