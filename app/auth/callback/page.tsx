import type { Metadata } from "next";
import { AuthCallback } from "@/components/auth/AuthCallback";

export const metadata: Metadata = { title: "Signing in | BACKED", robots: { index: false, follow: false } };

export default function AuthCallbackPage() {
  return <AuthCallback />;
}
