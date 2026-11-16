import { notFound } from "next/navigation";
import EvaluationReport from "@/models/EvaluationReport";
import { connectDB } from "@/lib/mongodb";
import { requireEvaluationUser } from "@/lib/evaluation/require-user";
import { ownedEvaluationFilter } from "@/lib/evaluation/submission";
import UserShell from "@/components/user/UserShell";
import ReportPreview from "@/components/reports/ReportPreview";
export default async function Preview({params}:{params:Promise<{id:string}>}){
  const user=await requireEvaluationUser(),{id}=await params;if(!/^[0-9a-f]{24}$/i.test(id))notFound();await connectDB();
  if(!await EvaluationReport.exists(ownedEvaluationFilter(user.id,id)))notFound();
  return <UserShell user={user} currentPage="/reports"><ReportPreview key={id} id={id}/></UserShell>;
}
