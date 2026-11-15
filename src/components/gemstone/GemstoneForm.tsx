import EvaluationWizard from "./EvaluationWizard";
import type { Variety } from "@/lib/evaluation/types";
export default function GemstoneForm({ userId, initialVariety }: { userId: string; initialVariety?: Variety }) { return <EvaluationWizard userId={userId} initialVariety={initialVariety} />; }
