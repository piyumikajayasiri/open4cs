"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type RuleType = "GRADING" | "PRICING";
type RuleStatus = "DRAFT" | "ACTIVE" | "INACTIVE";

interface EvaluationRule {
  _id: string;
  name: string;
  code: string;
  type: RuleType;
  description?: string;
  configuration: Record<string, unknown>;
  status: RuleStatus;
  version: number;
  createdAt?: string;
  updatedAt?: string;
}

export default function EvaluationRuleDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [rule, setRule] = useState<EvaluationRule | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<RuleStatus>("DRAFT");
  const [configurationJson, setConfigurationJson] = useState("{}");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadRule() {
      try {
        const response = await fetch(`/api/admin/evaluation-rules/${id}`, {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load evaluation rule.");
        }

        const loadedRule = data.rule as EvaluationRule;

        setRule(loadedRule);
        setName(loadedRule.name);
        setCode(loadedRule.code);
        setDescription(loadedRule.description ?? "");
        setStatus(loadedRule.status);
        setConfigurationJson(JSON.stringify(loadedRule.configuration, null, 2));
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to load evaluation rule.",
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      void loadRule();
    }
  }, [id]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!rule) return;

    let configuration: Record<string, unknown>;

    try {
      const parsed: unknown = JSON.parse(configurationJson);

      if (
        typeof parsed !== "object" ||
        parsed === null ||
        Array.isArray(parsed)
      ) {
        toast.error("Configuration must be a JSON object.");
        return;
      }

      configuration = parsed as Record<string, unknown>;
    } catch {
      toast.error("Invalid JSON. Please check your configuration.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/admin/evaluation-rules/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          code,
          description,
          configuration,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update evaluation rule.");
      }

      const updatedRule = data.rule as EvaluationRule;

      setRule(updatedRule);
      setName(updatedRule.name);
      setCode(updatedRule.code);
      setDescription(updatedRule.description ?? "");
      setStatus(updatedRule.status);
      setConfigurationJson(JSON.stringify(updatedRule.configuration, null, 2));

      toast.success(data.message || "Evaluation rule updated successfully.");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update evaluation rule.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Loading evaluation rule...
      </div>
    );
  }

  if (!rule) {
    return (
      <div className="space-y-4 p-6">
        <h1 className="text-xl font-semibold">Evaluation rule not found</h1>
        <p className="text-sm text-muted-foreground">
          The rule may have been deleted, or you may not have permission to
          access it.
        </p>
        <Button variant="outline">
          <Link href="/admin/evaluation-rules">Back to Evaluation Rules</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">
            <Link href="/admin/evaluation-rules" className="hover:underline">
              Evaluation Rules
            </Link>
            {" / "}Rule Details
          </div>

          <h1 className="text-2xl font-bold tracking-tight">{rule.name}</h1>

          <p className="text-sm text-muted-foreground">
            View and edit this {rule.type.toLowerCase()} rule.
          </p>
        </div>

        <Badge variant={rule.status === "ACTIVE" ? "default" : "secondary"}>
          {rule.status}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Rule type</p>
            <p className="mt-1 font-semibold">{rule.type}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Version</p>
            <p className="mt-1 font-semibold">v{rule.version}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Last updated</p>
            <p className="mt-1 font-semibold">
              {rule.updatedAt
                ? new Date(rule.updatedAt).toLocaleDateString()
                : "Not available"}
            </p>
          </CardContent>
        </Card>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Rule name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  minLength={2}
                  maxLength={150}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Rule code</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(event) =>
                    setCode(event.target.value.toUpperCase())
                  }
                  minLength={2}
                  maxLength={100}
                  pattern="[A-Za-z0-9_-]+"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Use letters, numbers, underscores or hyphens.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Rule type</Label>
              <Input value={rule.type} disabled />
              <p className="text-xs text-muted-foreground">
                The rule type cannot be changed after creation.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={1000}
                rows={3}
                placeholder="Explain the purpose of this rule..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as RuleStatus)
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>

              <p className="text-xs text-muted-foreground">
                Activating a rule does not by itself connect it to the gemstone
                evaluation engine.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {rule.type === "GRADING"
                ? "Grading Configuration"
                : "Pricing Configuration"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Edit the configuration as JSON. Keep the structure appropriate for
              the selected rule type.
            </p>
          </CardHeader>

          <CardContent className="space-y-3">
            <Textarea
              id="configuration"
              value={configurationJson}
              onChange={(event) => setConfigurationJson(event.target.value)}
              rows={18}
              spellCheck={false}
              className="font-mono text-sm"
              required
            />

            <p className="text-xs text-muted-foreground">
              {rule.type === "GRADING"
                ? 'Expected fields include "attribute", "method", and "criteria".'
                : 'Expected fields include "method", optional "currency", and "parameters".'}
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline">
            <Link href="/admin/evaluation-rules">Cancel</Link>
          </Button>

          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
