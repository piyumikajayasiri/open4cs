import UserShell from "@/components/user/UserShell";
import GemstoneCatalogue from "@/components/gemstone/GemstoneCatalogue";
import { requireEvaluationUser } from "@/lib/evaluation/require-user";
export default async function CataloguePage() {
  const user = await requireEvaluationUser();
  return <UserShell user={user}><GemstoneCatalogue /></UserShell>;
}
