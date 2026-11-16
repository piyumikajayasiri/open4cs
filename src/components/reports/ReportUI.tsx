"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReportSummary } from "@/lib/reports/server";
export function useReportGeneration(){
  const router=useRouter(),retry=useRef<{signature:string;key:string}|null>(null),locked=useRef(false);
  const [busy,setBusy]=useState(false),[error,setError]=useState("");
  async function generate(options:Record<string,string>){
    if(locked.current)return;locked.current=true;setBusy(true);setError("");
    const signature=JSON.stringify(options);if(retry.current?.signature!==signature)retry.current={signature,key:crypto.randomUUID()};
    try{const response=await fetch("/api/reports",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...options,generationKey:retry.current!.key})});const data=await response.json();if(!response.ok)throw new Error(data.message||"Report generation failed.");retry.current=null;router.push(`/reports/${data.report.id}`);router.refresh();}
    catch(error){setError(error instanceof Error?error.message:"Unable to generate the report. Retry to recover the same request.");}
    finally{locked.current=false;setBusy(false);}
  }
  return {generate,busy,error};
}
export const reportDate=(value:string)=>value&&Number.isFinite(Date.parse(value))?new Date(value).toLocaleString("en-GB",{timeZone:"Asia/Colombo",dateStyle:"medium",timeStyle:"short"}):"Not recorded";
export const reportType=(value:string)=>value==="FULL"?"Full Evaluation + Price":"Summary Statement";
export type { ReportSummary };
