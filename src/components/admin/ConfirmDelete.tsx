"use client";
import { displayText } from "@/lib/display-text";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function ConfirmDelete({ open, title, description, busy, error, onCancel, onConfirm }: {
  open: boolean; title: string; description: string; busy: boolean; error: string; onCancel: () => void; onConfirm: () => void;
}) {
  return <AlertDialog open={open} onOpenChange={(next) => { if (!next && !busy) onCancel(); }}><AlertDialogContent>
    <AlertDialogHeader><AlertDialogTitle>{displayText(title)}</AlertDialogTitle><AlertDialogDescription>{displayText(description)}</AlertDialogDescription></AlertDialogHeader>
    {error && <p role="alert" className="text-sm text-destructive">{displayText(error)}</p>}
    <AlertDialogFooter><AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel><AlertDialogAction variant="destructive" disabled={busy} onClick={onConfirm}>{busy ? "Deleting..." : "Delete"}</AlertDialogAction></AlertDialogFooter>
  </AlertDialogContent></AlertDialog>;
}
