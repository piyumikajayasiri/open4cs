import EvaluationWizard from "./EvaluationWizard";
import type { Variety } from "@/lib/evaluation/types";
export default function GemstoneForm({ userId, initialVariety, initialCatalogueId }: { userId: string; initialVariety?: Variety; initialCatalogueId?: string }) { return <EvaluationWizard initialCatalogueId={initialCatalogueId} userId={userId} initialVariety={initialVariety} />; }
