import ProfileForm from "@/components/profile/ProfileForm";

/**
 * Profile Page Component - Server Side
 * All client-side logic is handled in the ProfileForm component
 */
export default function ProfilePage() {
  return (
    <div className="fixed inset-0 bg-gray-50 overflow-y-auto lg:left-[250px] top-[56px] lg:top-[56px]">
      <div className="p-[10px] sm:p-[15px]">
        <ProfileForm />
      </div>
    </div>
  );
}
