import RegisterPage from "@/components/auth/RegisterForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apply Tech Signup",
  description: "Register as a tenant at applytech.org",
  // other metadata
};

export default function SignUp() {
  return <RegisterPage />;
}
