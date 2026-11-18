import { ACCOUNT_CATEGORIES } from "./account-validation.ts";
import { LEARNING_TOPIC_IDS } from "./learning.ts";
export const DEFAULT_PREFERENCES={dashboardActivity:true,showLearningHints:true};
export class SettingsValidationError extends Error{errors:Record<string,string>;constructor(errors:Record<string,string>){super("Correct the highlighted settings.");this.errors=errors;}}
export function validateSettings(body:unknown){
 if(!body||typeof body!=="object"||Array.isArray(body))throw new SettingsValidationError({form:"Provide settings to update."});
 const value=body as Record<string,unknown>,errors:Record<string,string>={};
 const allowed:Record<string,string[]>={PROFILE:["action","name","email","organization","category","preferences","updatedAt","currentPassword"],PASSWORD:["action","currentPassword","newPassword","confirmPassword"],DEACTIVATE:["action","currentPassword","confirmation"],LEARNING:["action","topicId","completed"]};
 const action=String(value.action);if(!Object.hasOwn(allowed,action)||Object.keys(value).some(key=>!allowed[action].includes(key)))throw new SettingsValidationError({form:"Unsupported settings action or field."});
 if(action==="PROFILE"){
  const name=typeof value.name==="string"?value.name.trim():"",email=typeof value.email==="string"?value.email.trim().toLowerCase():"",organization=typeof value.organization==="string"?value.organization.trim():"";
  if(name.length<2||name.length>100)errors.name="Use 2–100 characters.";
  if(email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))errors.email="Enter a valid email address.";
  if(organization.length>150)errors.organization="Use no more than 150 characters.";
  if(!ACCOUNT_CATEGORIES.includes(value.category as typeof ACCOUNT_CATEGORIES[number]))errors.category="Choose a supported category.";
  if(typeof value.updatedAt!=="string"||!Number.isFinite(Date.parse(value.updatedAt)))errors.form="Reload your current settings before saving.";
  const preferences=value.preferences as Record<string,unknown>|undefined;
  if(!preferences||typeof preferences!=="object"||Array.isArray(preferences)||Object.keys(preferences).some(key=>!Object.hasOwn(DEFAULT_PREFERENCES,key))||Object.keys(DEFAULT_PREFERENCES).some(key=>typeof preferences[key]!=="boolean"))errors.preferences="Choose valid display preferences.";
  if(Object.keys(errors).length)throw new SettingsValidationError(errors);
  return {...value,name,email,organization};
 }
 if(action==="LEARNING"){
  if(!LEARNING_TOPIC_IDS.includes(String(value.topicId))||typeof value.completed!=="boolean")errors.form="Choose a valid lesson and completion status.";
 }else{
  if(typeof value.currentPassword!=="string"||!value.currentPassword||value.currentPassword.length>1024)errors.currentPassword="Enter your current password.";
  if(action==="PASSWORD"){
   const password=typeof value.newPassword==="string"?value.newPassword:"";
   if(password.length<12||!/[0-9]/.test(password)||!/[^A-Za-z0-9]/.test(password))errors.newPassword="Use at least 12 characters including a number and symbol.";
   if(new TextEncoder().encode(password).length>72)errors.newPassword="Use no more than 72 UTF-8 bytes for your password.";
   if(value.confirmPassword!==password)errors.confirmPassword="Passwords do not match.";
   if(value.currentPassword===password)errors.newPassword="Choose a different password.";
  }else if(value.confirmation!=="DEACTIVATE")errors.confirmation="Type DEACTIVATE to confirm.";
 }
 if(Object.keys(errors).length)throw new SettingsValidationError(errors);return value;
}
export function settingsView(user:Record<string,unknown>){
 const preferences=user.preferences&&typeof user.preferences==="object"?user.preferences as Record<string,unknown>:{};
 return {name:String(user.name||""),email:String(user.email||""),organization:String(user.organization||""),category:String(user.category||"STUDENT"),role:String(user.role||"USER"),updatedAt:user.updatedAt instanceof Date?user.updatedAt.toISOString():String(user.updatedAt||""),preferences:{dashboardActivity:typeof preferences.dashboardActivity==="boolean"?preferences.dashboardActivity:true,showLearningHints:typeof preferences.showLearningHints==="boolean"?preferences.showLearningHints:true},learningProgress:Array.isArray(user.learningProgress)?user.learningProgress.filter(id=>typeof id==="string"&&LEARNING_TOPIC_IDS.includes(id)):[]};
}
export function sessionVersionMatches(tokenVersion:unknown,currentVersion:unknown){return (typeof tokenVersion==="number"?tokenVersion:0)===(typeof currentVersion==="number"?currentVersion:0);}
