import UserShell from "@/components/user/UserShell";
import LearningGuide from "@/components/learning/LearningGuide";
import { requireEvaluationUser } from "@/lib/evaluation/require-user";
export default async function LearningPage(){const user=await requireEvaluationUser();return <UserShell user={user} currentPage="/learning"><LearningGuide/></UserShell>;}
