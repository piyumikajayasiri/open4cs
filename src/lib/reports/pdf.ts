import PDFDocument from "pdfkit";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
const require = createRequire(import.meta.url);
import type { ReportSnapshot } from "./snapshot";
const clean=(value:string)=>value.replace(/[\u2010-\u2015]/g,"-").replace(/→/g,"to").replace(/×/g,"x").replace(/−/g,"-");
export async function renderReportPdf(snapshot:ReportSnapshot):Promise<{pdf:Buffer;pageCount:number}>{
  const doc=new PDFDocument({size:"A4",bufferPages:true,margins:{top:72,bottom:100,left:48,right:48},info:{Title:"Open 4Cs Gemstone Evaluation and Price Suggestion Report",Author:"Open 4Cs",Subject:snapshot.evaluationId,CreationDate:new Date(snapshot.generatedAt)}});
  doc.registerFont("Body",readFileSync(require.resolve("@fontsource/noto-sans/files/noto-sans-latin-400-normal.woff")));
  doc.registerFont("Heading",readFileSync(require.resolve("@fontsource/noto-sans/files/noto-sans-latin-700-normal.woff")));
  const chunks:Buffer[]=[];
  const finished=new Promise<Buffer>((resolve,reject)=>{doc.on("data",chunk=>chunks.push(Buffer.from(chunk)));doc.on("end",()=>resolve(Buffer.concat(chunks)));doc.on("error",reject);});
  const width=doc.page.width-96;
  function header(){const y=doc.y;doc.font("Heading").fontSize(11).fillColor("#14243b").text("OPEN 4Cs",48,27,{lineBreak:false});doc.font("Body").fontSize(8).fillColor("#65758b").text("Gemstone evaluation and price suggestion",150,30,{lineBreak:false});doc.moveTo(48,52).lineTo(doc.page.width-48,52).strokeColor("#dce3ec").stroke();doc.x=48;doc.y=Math.max(72,y);doc.font("Body").fontSize(10).fillColor("#334155");}
  header();doc.on("pageAdded",header);
  function space(height:number){if(doc.y+height>doc.page.height-100)doc.addPage();}
  function paragraph(value:string){doc.font("Body").fontSize(10).fillColor("#334155");doc.text(clean(value),48,doc.y,{width,lineGap:3,paragraphGap:8});doc.moveDown(0.35);}
  doc.font("Heading").fontSize(24).fillColor("#14243b").text("Gemstone Evaluation & Price Suggestion Report",{width,lineGap:3});doc.moveDown(0.5);
  paragraph(`${snapshot.name} | ${snapshot.reportType==="FULL"?"Full evaluation and price":"Summary statement"} | ${snapshot.audience}`);
  paragraph(`Report ${snapshot.reportId}
Evaluation ${snapshot.evaluationId}
Evaluation date: ${snapshot.evaluationDate||"Not recorded"}
Generated: ${snapshot.generatedAt}
Rule version: ${snapshot.ruleVersion}`);
  if(snapshot.dataKind==="MOCK"){space(36);doc.font("Heading").fontSize(11).fillColor("#a04e0d").text("SAMPLE DATA - NOT REAL MARKET EVIDENCE");doc.moveDown();}
  space(110);const y=doc.y;doc.roundedRect(48,y,width,94,7).fill("#14243b");doc.font("Body").fontSize(9).fillColor("#c5d4e7").text("SAVED SUGGESTED PRICE RANGE",64,y+16,{width:width-32});doc.font("Heading").fontSize(19).fillColor("white").text(clean(snapshot.priceRange),64,y+37,{width:width-32});doc.x=48;doc.y=y+112;
  paragraph(snapshot.scores.map(item=>`${item.label}: ${item.value}`).join("    |    "));
  for(const section of snapshot.sections){
    const concise=section.rows.length<=6&&section.paragraphs.every(value=>value.length<240)&&section.rows.every(([label,value])=>label.length<80&&value.length<180);
    space(concise?Math.min(270,70+section.rows.length*31+section.paragraphs.length*38):75);doc.moveDown(0.4);doc.font("Heading").fontSize(14).fillColor("#14243b").text(clean(section.title),48,doc.y,{width});doc.moveDown(0.55);
    for(const value of section.paragraphs)paragraph(value);
    for(const [label,value] of section.rows){
      const labelWidth=142,valueWidth=width-labelWidth-14;
      doc.font("Heading").fontSize(9);const labelHeight=doc.heightOfString(clean(label),{width:labelWidth,lineGap:2});
      doc.font("Body").fontSize(10);const valueHeight=doc.heightOfString(clean(value),{width:valueWidth,lineGap:2});
      const height=Math.max(labelHeight,valueHeight)+12;
      if(height>doc.page.height-172){space(45);doc.font("Heading").fontSize(9).fillColor("#52647e").text(clean(label),48,doc.y,{width});doc.moveDown(0.2);paragraph(value);continue;}
      space(height);const rowY=doc.y;
      doc.font("Heading").fontSize(9).fillColor("#52647e").text(clean(label),48,rowY,{width:labelWidth,lineGap:2});
      doc.font("Body").fontSize(10).fillColor("#334155").text(clean(value),48+labelWidth+14,rowY,{width:valueWidth,lineGap:2});
      doc.x=48;doc.y=rowY+height;
    }
  }
  const {start,count}=doc.bufferedPageRange();
  for(let index=start;index<start+count;index++){
    doc.switchToPage(index);doc.page.margins.bottom=0;
    doc.moveTo(48,doc.page.height-83).lineTo(doc.page.width-48,doc.page.height-83).strokeColor("#dce3ec").stroke();
    doc.font("Body").fontSize(7).fillColor("#52647e").text(clean(snapshot.disclaimer),48,doc.page.height-74,{width,lineGap:1});
    doc.fontSize(7).text(clean(`${snapshot.reportId} | ${snapshot.ruleVersion}`),48,doc.page.height-30,{width:width-80,lineBreak:false});
    doc.text(`Page ${index-start+1} of ${count}`,doc.page.width-115,doc.page.height-30,{width:67,align:"right",lineBreak:false});
  }
  doc.end();const pdf=await finished;
  if(pdf.length>8*1024*1024)throw new Error("Report exceeds the supported PDF size.");
  return {pdf,pageCount:count};
}
