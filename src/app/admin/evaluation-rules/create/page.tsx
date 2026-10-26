"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type RuleType = "GRADING" | "PRICING";
type GradingMethod = "CATEGORICAL" | "NUMERIC" | "BOOLEAN";
type PricingMethod = "REFERENCE_BASED" | "FIXED_FORMULA" | "RANGE_ESTIMATE";

type Criterion = {
  code: string;
  label: string;
  description: string;
  minValue: string;
  maxValue: string;
};

const attributes = [
  { value: "COLOUR", label: "Colour" },
  { value: "CLARITY", label: "Clarity" },
  { value: "CUT", label: "Cut" },
  { value: "CARAT_WEIGHT", label: "Carat Weight" },
  { value: "TREATMENT", label: "Treatment" },
  { value: "ORIGIN", label: "Origin" },
  { value: "OTHER", label: "Other Attribute" },
];

export default function CreateEvaluationRulePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState<RuleType>("GRADING");
  const [description, setDescription] = useState("");

  const [attribute, setAttribute] = useState("COLOUR");
  const [customAttribute, setCustomAttribute] = useState("");
  const [gradingMethod, setGradingMethod] =
    useState<GradingMethod>("CATEGORICAL");
  const [criteria, setCriteria] = useState<Criterion[]>([
    {
      code: "",
      label: "",
      description: "",
      minValue: "",
      maxValue: "",
    },
  ]);

  const [pricingMethod, setPricingMethod] =
    useState<PricingMethod>("REFERENCE_BASED");
  const [currency, setCurrency] = useState("");
  const [parametersJson, setParametersJson] = useState("{}");

  const [saving, setSaving] = useState(false);

  function updateCriterion(
    index: number,
    field: keyof Criterion,
    value: string,
  ) {
    setCriteria((current) =>
      current.map((criterion, i) =>
        i === index ? { ...criterion, [field]: value } : criterion,
      ),
    );
  }

  function addCriterion() {
    setCriteria((current) => [
      ...current,
      {
        code: "",
        label: "",
        description: "",
        minValue: "",
        maxValue: "",
      },
    ]);
  }

  function removeCriterion(index: number) {
    setCriteria((current) => current.filter((_, i) => i !== index));
  }

  function buildConfiguration() {
    if (type === "GRADING") {
      const resolvedAttribute =
        attribute === "OTHER"
          ? customAttribute.trim().toUpperCase().replace(/\s+/g, "_")
          : attribute;

      return {
        attribute: resolvedAttribute,
        method: gradingMethod,
        criteria: criteria.map((criterion) => ({
          code: criterion.code.trim(),
          label: criterion.label.trim(),
          ...(criterion.description.trim()
            ? { description: criterion.description.trim() }
            : {}),
          ...(criterion.minValue.trim()
            ? { minValue: Number(criterion.minValue) }
            : {}),
          ...(criterion.maxValue.trim()
            ? { maxValue: Number(criterion.maxValue) }
            : {}),
        })),
      };
    }

    return {
      method: pricingMethod,
      ...(currency.trim() ? { currency: currency.trim().toUpperCase() } : {}),
      parameters: JSON.parse(parametersJson),
    };
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    let configuration: ReturnType<typeof buildConfiguration>;

    try {
      configuration = buildConfiguration();
    } catch {
      toast.error("Pricing parameters must contain valid JSON.");
      return;
    }

    if (
      type === "GRADING" &&
      attribute === "OTHER" &&
      !customAttribute.trim()
    ) {
      toast.error("Enter the custom grading attribute.");
      return;
    }

    if (type === "GRADING") {
      if (
        criteria.length === 0 ||
        criteria.some(
          (criterion) => !criterion.code.trim() || !criterion.label.trim(),
        )
      ) {
        toast.error("Every criterion needs a code and label.");
        return;
      }

      if (
        criteria.some(
          (criterion) =>
            (criterion.minValue.trim() &&
              !Number.isFinite(Number(criterion.minValue))) ||
            (criterion.maxValue.trim() &&
              !Number.isFinite(Number(criterion.maxValue))),
        )
      ) {
        toast.error("Minimum and maximum values must be valid numbers.");
        return;
      }

      if (
        criteria.some(
          (criterion) =>
            criterion.minValue.trim() &&
            criterion.maxValue.trim() &&
            Number(criterion.minValue) > Number(criterion.maxValue),
        )
      ) {
        toast.error("A minimum value cannot exceed its maximum.");
        return;
      }
    }

    setSaving(true);

    try {
      const response = await fetch("/api/admin/evaluation-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          code,
          type,
          description,
          configuration,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to create evaluation rule.");
      }

      toast.success("Draft rule created successfully.");
      router.push("/admin/evaluation-rules");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create evaluation rule.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <Button variant="ghost" className="mb-3 -ml-3">
          <Link href="/admin/evaluation-rules">← Back to Evaluation Rules</Link>
        </Button>

        <h1 className="text-3xl font-bold tracking-tight">
          Create Evaluation Rule
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Configure a grading or pricing rule. New rules are saved as drafts.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Rule Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Colour Grading"
                minLength={2}
                maxLength={150}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Unique Rule Code *</Label>
              <Input
                id="code"
                value={code}
                onChange={(event) =>
                  setCode(
                    event.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9_-]/g, "_"),
                  )
                }
                placeholder="e.g. COLOUR_GRADING"
                minLength={2}
                maxLength={100}
                pattern="[A-Z0-9_-]+"
                required
              />
              <p className="text-xs text-muted-foreground">
                Use uppercase letters, numbers, underscores or hyphens. This
                code must be unique.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Rule Type *</Label>
              <Select
                value={type}
                onValueChange={(value) => setType(value as RuleType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GRADING">Grading Rule</SelectItem>
                  <SelectItem value="PRICING">Pricing Rule</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Explain the purpose of this rule..."
                maxLength={1000}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {type === "GRADING" ? (
          <Card>
            <CardHeader>
              <CardTitle>Grading Configuration</CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Attribute *</Label>
                <Select
                  value={attribute}
                  onValueChange={(value) => {
                    if (value !== null) setAttribute(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {attributes.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {attribute === "OTHER" && (
                <div className="space-y-2">
                  <Label htmlFor="customAttribute">Custom Attribute *</Label>
                  <Input
                    id="customAttribute"
                    value={customAttribute}
                    onChange={(event) => setCustomAttribute(event.target.value)}
                    placeholder="Enter attribute name"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Evaluation Method *</Label>
                <Select
                  value={gradingMethod}
                  onValueChange={(value) =>
                    setGradingMethod(value as GradingMethod)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CATEGORICAL">Categorical</SelectItem>
                    <SelectItem value="NUMERIC">Numeric</SelectItem>
                    <SelectItem value="BOOLEAN">Boolean</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="font-medium">Criteria</h3>
                  <p className="text-sm text-muted-foreground">
                    Add the criteria defined by your research or approved
                    project methodology. No grading scale is pre-filled.
                  </p>
                </div>

                {criteria.map((criterion, index) => (
                  <div key={index} className="space-y-3 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">
                        Criterion {index + 1}
                      </p>

                      {criteria.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCriterion(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Criterion Code *</Label>
                        <Input
                          value={criterion.code}
                          onChange={(event) =>
                            updateCriterion(
                              index,
                              "code",
                              event.target.value
                                .toUpperCase()
                                .replace(/[^A-Z0-9_-]/g, "_"),
                            )
                          }
                          placeholder="e.g. CATEGORY_A"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Label *</Label>
                        <Input
                          value={criterion.label}
                          onChange={(event) =>
                            updateCriterion(index, "label", event.target.value)
                          }
                          placeholder="Display label"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        value={criterion.description}
                        onChange={(event) =>
                          updateCriterion(
                            index,
                            "description",
                            event.target.value,
                          )
                        }
                        placeholder="Optional explanation"
                      />
                    </div>

                    {gradingMethod === "NUMERIC" && (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Minimum Value</Label>
                          <Input
                            type="number"
                            step="any"
                            value={criterion.minValue}
                            onChange={(event) =>
                              updateCriterion(
                                index,
                                "minValue",
                                event.target.value,
                              )
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Maximum Value</Label>
                          <Input
                            type="number"
                            step="any"
                            value={criterion.maxValue}
                            onChange={(event) =>
                              updateCriterion(
                                index,
                                "maxValue",
                                event.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <Button type="button" variant="outline" onClick={addCriterion}>
                  + Add Criterion
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Pricing Configuration</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Pricing Method *</Label>
                <Select
                  value={pricingMethod}
                  onValueChange={(value) =>
                    setPricingMethod(value as PricingMethod)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REFERENCE_BASED">
                      Reference-Based
                    </SelectItem>
                    <SelectItem value="FIXED_FORMULA">Fixed Formula</SelectItem>
                    <SelectItem value="RANGE_ESTIMATE">
                      Range Estimate
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency (optional)</Label>
                <Input
                  id="currency"
                  value={currency}
                  onChange={(event) =>
                    setCurrency(event.target.value.toUpperCase().slice(0, 3))
                  }
                  placeholder="e.g. LKR"
                  maxLength={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parameters">Parameters (JSON) *</Label>
                <Textarea
                  id="parameters"
                  value={parametersJson}
                  onChange={(event) => setParametersJson(event.target.value)}
                  rows={6}
                  className="font-mono text-sm"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Enter valid JSON representing your proposed method. Parameters
                  are not applied to actual price calculations until the pricing
                  engine supports and validates them.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="outline">
            <Link href="/admin/evaluation-rules">Cancel</Link>
          </Button>

          <Button type="submit" disabled={saving}>
            {saving ? "Creating..." : "Create Draft Rule"}
          </Button>
        </div>
      </form>
    </div>
  );
}
