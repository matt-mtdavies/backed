import type { Metadata } from "next";
import { LoginFlow } from "@/components/auth/LoginFlow";

export const metadata: Metadata = { title: "Sign in | BACKED", robots: { index: false, follow: false } };

export default function LoginPage() {
  return <LoginFlow />;
}
