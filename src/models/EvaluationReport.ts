import mongoose, { Schema } from "mongoose";
const schema = new Schema({
  reportId:{type:String,required:true,unique:true},userId:{type:Schema.Types.ObjectId,required:true,ref:"User"},
  evaluationId:{type:Schema.Types.ObjectId,required:true,ref:"Evaluation"},evaluationPublicId:{type:String,required:true},
  generationKey:{type:String,required:true},requestHash:{type:String,required:true},
  rootReportId:{type:String,required:true},parentReportId:{type:String,default:null},
  reportType:{type:String,enum:["FULL","SUMMARY"],required:true},audience:{type:String,required:true},
  gemstoneName:{type:String,required:true},dataKind:{type:String,required:true},ruleVersion:{type:String,required:true},evaluationDate:String,
  snapshot:{type:Schema.Types.Mixed,required:true,immutable:true},
  pdf:{type:Buffer,required:true,select:false,immutable:true},sha256:{type:String,required:true},pageCount:{type:Number,required:true},byteLength:{type:Number,required:true},rendererVersion:{type:String,required:true},
},{timestamps:true,collection:"evaluation_reports"});
schema.index({userId:1,generationKey:1},{unique:true,name:"report_owner_generation"});
schema.index({userId:1,createdAt:-1,_id:-1});schema.index({userId:1,rootReportId:1,createdAt:-1});
export default mongoose.models.EvaluationReport || mongoose.model("EvaluationReport",schema);
