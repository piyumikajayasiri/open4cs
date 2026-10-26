"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type RuleType = "GRADING" | "PRICING";
type RuleStatus = "DRAFT" | "ACTIVE" | "INACTIVE";

type EvaluationRule = {
  _id: string;
  name: string;
  code: string;
  type: RuleType;
  description?: string;
  status: RuleStatus;
  version: number;
  updatedAt: string;
};

const statusStyles: Record<RuleStatus, string> = {
  DRAFT: "bg-amber-100 text-amber-800",
  ACTIVE: "bg-emerald-100 text-emerald-800",
  INACTIVE: "bg-slate-100 text-slate-700",
};

export default function EvaluationRulesPage() {
  const router = useRouter();

  const [rules, setRules] = useState<EvaluationRule[]>([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingRule, setPendingRule] = useState<EvaluationRule | null>(null);
  const [updating, setUpdating] = useState(false);

  const handleTypeChange = (value: string | null) => setType(value ?? "ALL");
  const handleStatusChange = (value: string | null) =>
    setStatus(value ?? "ALL");

  const loadRules = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (search.trim()) params.set("search", search.trim());
      if (type !== "ALL") params.set("type", type);
      if (status !== "ALL") params.set("status", status);

      const response = await fetch(
        `/api/admin/evaluation-rules?${params.toString()}`,
        { cache: "no-store" },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load evaluation rules.");
      }

      setRules(data.rules);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load evaluation rules.",
      );
    } finally {
      setLoading(false);
    }
  }, [search, type, status]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void loadRules();
    }, 250);

    return () => clearTimeout(timeout);
  }, [loadRules]);

  async function updateStatus() {
    if (!pendingRule) return;

    const nextStatus: RuleStatus =
      pendingRule.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    setUpdating(true);

    try {
      const response = await fetch(
        `/api/admin/evaluation-rules/${pendingRule._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update rule status.");
      }

      toast.success(
        nextStatus === "ACTIVE"
          ? "Rule activated successfully."
          : "Rule deactivated successfully.",
      );

      setPendingRule(null);
      await loadRules();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to update rule status.",
      );
    } finally {
      setUpdating(false);
    }
  }

  const gradingCount = rules.filter((rule) => rule.type === "GRADING").length;

  const pricingCount = rules.filter((rule) => rule.type === "PRICING").length;

  const activeCount = rules.filter((rule) => rule.status === "ACTIVE").length;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Administration
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            Evaluation Rules
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage grading criteria and pricing calculation rules.
          </p>
        </div>

        <Button onClick={() => router.push("/admin/evaluation-rules/create")}>
          + Create Rule
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Matching Rules</p>
            <p className="mt-2 text-3xl font-bold">{rules.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Grading Rules</p>
            <p className="mt-2 text-3xl font-bold">{gradingCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Pricing / Active</p>
            <p className="mt-2 text-3xl font-bold">
              {pricingCount} / {activeCount}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              placeholder="Search by rule name or code..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <Select value={type} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All types</SelectItem>
                <SelectItem value="GRADING">Grading</SelectItem>
                <SelectItem value="PRICING">Pricing</SelectItem>
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
            >
              {error}
              <Button
                variant="link"
                className="ml-2"
                onClick={() => void loadRules()}
              >
                Retry
              </Button>
            </div>
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rule</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Loading evaluation rules...
                    </TableCell>
                  </TableRow>
                ) : rules.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No evaluation rules found.
                    </TableCell>
                  </TableRow>
                ) : (
                  rules.map((rule) => (
                    <TableRow key={rule._id}>
                      <TableCell>
                        <div className="font-medium">{rule.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {rule.code}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline">{rule.type}</Badge>
                      </TableCell>

                      <TableCell>v{rule.version}</TableCell>

                      <TableCell>
                        <Badge className={statusStyles[rule.status]}>
                          {rule.status}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {new Date(rule.updatedAt).toLocaleDateString("en-GB")}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/admin/evaluation-rules/${rule._id}`)
                            }
                          >
                            View / Edit
                          </Button>

                          <Button
                            variant={
                              rule.status === "ACTIVE"
                                ? "destructive"
                                : "secondary"
                            }
                            size="sm"
                            onClick={() => setPendingRule(rule)}
                          >
                            {rule.status === "ACTIVE"
                              ? "Deactivate"
                              : "Activate"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <p className="text-xs text-muted-foreground">
            Rule counts reflect the current search and filter results.
          </p>
        </CardContent>
      </Card>

      <AlertDialog
        open={pendingRule !== null}
        onOpenChange={(open) => {
          if (!open && !updating) setPendingRule(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingRule?.status === "ACTIVE"
                ? "Deactivate this rule?"
                : "Activate this rule?"}
            </AlertDialogTitle>

            <AlertDialogDescription>
              {pendingRule?.status === "ACTIVE"
                ? `Deactivating "${pendingRule.name}" may affect future evaluations that rely on this rule.`
                : `Activate "${pendingRule?.name}" for potential use by the evaluation engine? Check that its configuration has been validated.`}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={updating}>Cancel</AlertDialogCancel>

            <AlertDialogAction
              disabled={updating}
              onClick={(event) => {
                event.preventDefault();
                void updateStatus();
              }}
            >
              {updating ? "Updating..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
