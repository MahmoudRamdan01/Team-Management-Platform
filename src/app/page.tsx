import { redirect } from "next/navigation";
import { getServerContext } from "@/lib/server/context";

export default async function RootPage() {
  const { user } = await getServerContext();
  redirect(user ? "/dashboard" : "/login");
}
