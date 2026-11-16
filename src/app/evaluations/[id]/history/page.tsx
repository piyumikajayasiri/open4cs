import { notFound } from "next/navigation";
import Evaluation from "@/models/Evaluation";
import { connectDB } from "@/lib/mongodb";
import { requireEvaluationUser } from "@/lib/evaluation/require-user";
import { ownedEvaluationFilter } from "@/lib/evaluation/submission";
import UserShell from "@/components/user/UserShell";
import HistoricalPricing from "@/components/gemstone/HistoricalPricing";
export default async function PricingHistoryPage({params}:{params:Promise<{id:string}>}){
  const user=await requireEvaluationUser(),{id}=await params;
  if(!/^[0-9a-f]{24}$/i.test(id))notFound();await connectDB();
  if(!await Evaluation.exists(ownedEvaluationFilter(user.id,id)))notFound();
  return <UserShell user={user}><HistoricalPricing id={id}/></UserShell>;
}
