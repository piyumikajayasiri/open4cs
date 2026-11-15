import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { UserIdentity } from "@/components/user/UserShell";
export async function requireEvaluationUser(): Promise<UserIdentity> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return { id: session.user.id, name: session.user.name || "User", email: session.user.email || "", role: session.user.role, category: session.user.category };
}
