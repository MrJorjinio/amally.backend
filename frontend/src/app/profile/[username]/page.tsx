import { ProfileContent } from "@/components/profile/ProfileContent";

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  return <ProfileContent paramsPromise={params} />;
}
