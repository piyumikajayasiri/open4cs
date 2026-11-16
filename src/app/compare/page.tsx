import UserShell from "@/components/user/UserShell";
import GemstoneComparison from "@/components/gemstone/GemstoneComparison";
import { requireEvaluationUser } from "@/lib/evaluation/require-user";
export default async function ComparePage({searchParams}:{searchParams:Promise<{ids?:string}>}){
  const user=await requireEvaluationUser(),{ids}=await searchParams;
  const initialIds=(ids||"").split(",").filter(id=>/^[0-9a-f]{24}$/i.test(id)).map(id=>id.toLowerCase());
  return <UserShell user={user} currentPage="/compare"><GemstoneComparison initialIds={[...new Set(initialIds)].slice(0,3)}/></UserShell>;
}
