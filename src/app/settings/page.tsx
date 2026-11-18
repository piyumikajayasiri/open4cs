import UserShell from "@/components/user/UserShell";
import AccountSettings from "@/components/account/AccountSettings";
import { requireEvaluationUser } from "@/lib/evaluation/require-user";
export default async function SettingsPage(){const user=await requireEvaluationUser();return <UserShell user={user} currentPage="/settings"><AccountSettings/></UserShell>;}
