import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { evaluationRoute } from "@/lib/evaluation/user-route";
import { validateSettings,settingsView,SettingsValidationError } from "@/lib/account-settings";
const headers={"Cache-Control":"private, no-store"};
export async function GET(request:Request){return evaluationRoute(request,async(actor)=>{const user=await User.findOne({_id:actor.id,status:"ACTIVE",deletedAt:null}).lean();if(!user)return NextResponse.json({message:"Account is not active."},{status:403});return NextResponse.json({account:settingsView(user)},{headers});});}
export async function PATCH(request:Request){return evaluationRoute(request,async(actor)=>{
 try{
  let raw:unknown;try{raw=await request.json();}catch{return NextResponse.json({message:"Invalid settings request."},{status:400});}
  const body=validateSettings(raw),user=await User.findOne({_id:actor.id,status:"ACTIVE",deletedAt:null}).select("+passwordHash +sessionVersion");
  if(!user)return NextResponse.json({message:"Account is not active."},{status:403});
  const filter:Record<string,unknown>={_id:actor.id,status:"ACTIVE",deletedAt:null};let update:Record<string,unknown>={};
  if(body.action==="PROFILE"){
   if(user.updatedAt.toISOString()!==body.updatedAt)return NextResponse.json({message:"Settings changed in another window. Reload before saving."},{status:409});
   filter.updatedAt=user.updatedAt;
   if(body.email!==user.email){if(typeof body.currentPassword!=="string"||body.currentPassword.length>1024||!await bcrypt.compare(body.currentPassword,user.passwordHash))return NextResponse.json({message:"Confirm your current password to change your email.",errors:{currentPassword:"Current password is incorrect."}},{status:400});filter.passwordHash=user.passwordHash;}
   update={$set:{name:body.name,email:body.email,organization:body.organization,category:body.category,preferences:body.preferences}};
  }else if(body.action==="LEARNING"){
   update=body.completed?{$addToSet:{learningProgress:body.topicId}}:{$pull:{learningProgress:body.topicId}};
  }else{
   if(!await bcrypt.compare(String(body.currentPassword),user.passwordHash))return NextResponse.json({message:"Current password is incorrect.",errors:{currentPassword:"Current password is incorrect."}},{status:400});
   filter.passwordHash=user.passwordHash;
   if(body.action==="PASSWORD")update={$set:{passwordHash:await bcrypt.hash(String(body.newPassword),12)},$inc:{sessionVersion:1}};
   else{if(user.role==="ADMIN")return NextResponse.json({message:"Administrator accounts must be managed by another administrator through User Management."},{status:403});update={$set:{status:"INACTIVE",isActive:false,deletedAt:new Date(),deletedBy:actor.id},$inc:{sessionVersion:1}};}
  }
  const saved=await User.findOneAndUpdate(filter,update,{new:true,runValidators:true});
  if(!saved)return NextResponse.json({message:"Account changed. Reload and try again."},{status:409});
  return NextResponse.json({success:true,signOut:body.action==="PASSWORD"||body.action==="DEACTIVATE",account:settingsView(saved.toObject())},{headers});
 }catch(error){if(error instanceof SettingsValidationError)return NextResponse.json({message:error.message,errors:error.errors},{status:400});if(error&&typeof error==="object"&&"code" in error&&error.code===11000)return NextResponse.json({message:"That email is already registered.",errors:{email:"Choose another email."}},{status:409});throw error;}
});}
