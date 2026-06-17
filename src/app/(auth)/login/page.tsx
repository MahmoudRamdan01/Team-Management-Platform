import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { getServerContext } from "@/lib/server/context";

export default async function LoginPage() {
  const { user } = await getServerContext();
  if (user) redirect("/dashboard");

  return (
    <Suspense fallback={<div className="text-mist">…</div>}>
      <LoginForm />
    </Suspense>
  );
}
