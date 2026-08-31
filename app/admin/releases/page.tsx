import { AdminReleaseBacking } from "@/components/admin/AdminReleaseBacking";

export const metadata = { title: "Release backing | BACKED", robots: { index: false, follow: false } };

export default function AdminReleasesPage() {
  return <AdminReleaseBacking />;
}
