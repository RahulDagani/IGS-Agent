import LoginForm from "@/components/auth/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apply Tech Login",
  description: "Login to applytech.org",
};

export default function SignIn() {
  return <LoginForm />;
}
