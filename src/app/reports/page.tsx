import UserShell from "@/components/user/UserShell";
import ReportsPage from "@/components/reports/ReportsPage";
import { requireEvaluationUser } from "@/lib/evaluation/require-user";
export default async function Reports({searchParams}:{searchParams:Promise<{evaluationId?:string}>}){
  const user=await requireEvaluationUser(),{evaluationId}=await searchParams;
  return <UserShell user={user} currentPage="/reports"><ReportsPage category={user.category} initialEvaluationId={evaluationId&&/^[0-9a-f]{24}$/i.test(evaluationId)?evaluationId:undefined}/></UserShell>;
}
