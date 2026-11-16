import { displayText } from "@/lib/display-text";
import Link from "next/link";
import { notFound } from "next/navigation";
import Evaluation from "@/models/Evaluation";
import { connectDB } from "@/lib/mongodb";
import { evaluationDetail, ownedEvaluationFilter } from "@/lib/evaluation/submission";
import { requireEvaluationUser } from "@/lib/evaluation/require-user";
import UserShell from "@/components/user/UserShell";
import EvaluationResult from "@/components/gemstone/EvaluationResult";

export default async function SavedEvaluationPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireEvaluationUser();
  const { id } = await params;
  if (!/^[0-9a-f]{24}$/i.test(id)) notFound();
  await connectDB();
  const document = await Evaluation.findOne(ownedEvaluationFilter(user.id, id)).lean();
  if (!document) notFound();
  const saved = evaluationDetail(document);
  const input = saved.inputSnapshot;
  const date = saved.createdAt ? new Date(saved.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Colombo", dateStyle: "medium", timeStyle: "short" }) : "Date unavailable";
  return <UserShell user={user}><Link href="/dashboard" className="text-sm text-blue-600">← Back to your evaluations</Link><header><h1 className="text-2xl font-bold">Evaluation Complete</h1><p className="mt-2 text-sm text-slate-500">{displayText(saved.evaluationId)} · {saved.variety.toLowerCase()} · {date} (Sri Lanka time)</p><p className="mt-2 text-sm text-slate-500">This is the stored result. Later rule or historical-record changes do not alter it.</p></header>
    <div className="flex flex-wrap gap-5 text-sm text-blue-600"><Link href={`/compare?ids=${saved._id}`}>Add to gemstone comparison</Link><Link href={`/evaluations/${saved._id}/history`}>View reference & historical pricing</Link><Link href={`/reports?evaluationId=${saved._id}`}>Generate PDF Report</Link></div>
    {saved.result ? <EvaluationResult result={saved.result} input={input} guidance={saved.guidanceSnapshot} /> : <section className="rounded-xl border bg-white p-5"><h2 className="font-semibold">Legacy evaluation</h2><p className="mt-2 text-sm">Rule version: {displayText(saved.ruleVersion)}. Saved price range: {saved.priceRange}.</p><p className="mt-2 text-sm text-slate-500">This older record has no complete reproducible input and rule snapshot.</p></section>}
    {input && <section className="rounded-xl border bg-white p-5"><h2 className="font-semibold">Saved gemstone observations</h2><div className="mt-3 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4"><p>Weight: <strong>{input.caratWeight} ct</strong></p><p>Shape: <strong>{input.shape.toLowerCase()}</strong></p><p>Origin: <strong>{input.origin}</strong></p><p>Treatment: <strong>{input.treatment.toLowerCase()}</strong></p></div><details className="mt-4 text-sm"><summary className="cursor-pointer font-medium text-blue-600">View all observations</summary><dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{Object.entries(input).flatMap(([section, value]) => typeof value === "object" ? Object.entries(value).map(([key, observation]) => <div key={`${section}.${key}`}><dt className="text-xs capitalize text-slate-500">{section} · {key.replace(/([a-z])([A-Z])/g, "$1 $2")}</dt><dd className="mt-1">{String(observation).replaceAll("_", " ")}</dd></div>) : [<div key={section}><dt className="text-xs capitalize text-slate-500">{section.replace(/([a-z])([A-Z])/g, "$1 $2")}</dt><dd className="mt-1">{String(value).replaceAll("_", " ")}</dd></div>])}</dl></details></section>}
  </UserShell>;
}

