import UserShell from "@/components/user/UserShell";
import UserHome from "@/components/user/UserHome";
import UserDashboard from "@/components/user/UserDashboard";
import { requireEvaluationUser } from "@/lib/evaluation/require-user";
export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const user = await requireEvaluationUser();
  const { tab } = await searchParams;
  return <UserShell user={user} currentPage={tab === "history" ? "/dashboard?tab=history" : tab === "evaluations" ? "/dashboard?tab=evaluations" : "/dashboard"}>{tab === "history" || tab === "evaluations" ? <UserDashboard key={tab} history={tab === "history"}/> : <UserHome userId={user.id}/>}</UserShell>;
}
