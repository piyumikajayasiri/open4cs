import UserShell from "@/components/user/UserShell";
import GemstoneForm from "@/components/gemstone/GemstoneForm";
import { requireEvaluationUser } from "@/lib/evaluation/require-user";
export default async function EvaluatePage({ searchParams }: { searchParams: Promise<{ variety?: string; catalogueId?: string }> }) {
  const user = await requireEvaluationUser();
  const { variety, catalogueId } = await searchParams;
  return <UserShell user={user}><GemstoneForm initialCatalogueId={catalogueId} userId={user.id} initialVariety={variety === "RUBY" || variety === "SAPPHIRE" ? variety : undefined} /></UserShell>;
}
