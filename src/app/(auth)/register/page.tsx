import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { getServerContext } from "@/lib/server/context";

export default async function RegisterPage() {
  const { user } = await getServerContext();
  if (user) redirect("/dashboard");
  return <RegisterForm />;
}
