"use client";

import { useState } from "react";

export type EvaluationOption = {
  _id: string;
  variety: string;
  caratWeight: string;
  overallScore: number;
  colorScore: number;
  clarityScore: number;
  cutScore: number;
  caratScore: number;
  treatmentStatus: string;
  originValue: string;
  suggestedPriceText: string;
  priceRangeText: string;
  measurementReliability: string;
  treatmentReliability: string;
  originReliability: string;
  createdAt: string;
};

type EvaluationComparisonProps = {
  evaluations: EvaluationOption[];
};

export default function EvaluationComparison({
  evaluations,
}: EvaluationComparisonProps) {
  const [firstId, setFirstId] = useState("");
  const [secondId, setSecondId] = useState("");

  const firstEvaluation = evaluations.find(
    (evaluation) => evaluation._id === firstId
  );

  const secondEvaluation = evaluations.find(
    (evaluation) => evaluation._id === secondId
  );

  if (evaluations.length < 2) {
    return (
      <section className="mt-8 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-7">
        <h2 className="text-2xl font-bold">
          Compare Evaluations
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Save at least two gemstone evaluations before using the
          comparison feature.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-8 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-7">
      <div>
        <span className="inline-flex rounded-full bg-[var(--primary-soft)] px-3 py-1 text-sm font-semibold text-[var(--primary-dark)]">
          Comparison
        </span>

        <h2 className="mt-3 text-2xl font-bold">
          Compare Two Evaluations
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
          Choose two of your saved gemstone evaluations to view them
          side by side.
        </p>
      </div>

      <div className="mt-7 grid gap-5 md:grid-cols-2">
        <EvaluationSelector
          label="First gemstone"
          value={firstId}
          onChange={setFirstId}
          evaluations={evaluations}
          disabledId={secondId}
        />

        <EvaluationSelector
          label="Second gemstone"
          value={secondId}
          onChange={setSecondId}
          evaluations={evaluations}
          disabledId={firstId}
        />
      </div>

      {firstEvaluation && secondEvaluation && (
        <div className="mt-7 space-y-8">
          {/* 4C Score Comparison Table */}
          <div className="space-y-4">
            <div className="rounded-2xl bg-[var(--surface-soft)] p-5">
              <h3 className="font-bold">
                Side-by-side 4C comparison
              </h3>

              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Compare the evaluation scores for each gemstone. A higher score
                in one area only means it received a higher rule-based score for
                that part of this evaluation.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-white">
              <div className="min-w-[600px]">
                <div className="grid grid-cols-[1fr_1fr_1fr] bg-[var(--surface-soft)]">
                  <div className="p-4 text-sm font-semibold text-[var(--muted)]">
                    Evaluation Area
                  </div>

                  <GemstoneHeading evaluation={firstEvaluation} />

                  <GemstoneHeading evaluation={secondEvaluation} />
                </div>

                <ComparisonRow
                  label="Overall 4C"
                  first={firstEvaluation.overallScore}
                  second={secondEvaluation.overallScore}
                />

                <ComparisonRow
                  label="Color"
                  first={firstEvaluation.colorScore}
                  second={secondEvaluation.colorScore}
                />

                <ComparisonRow
                  label="Clarity"
                  first={firstEvaluation.clarityScore}
                  second={secondEvaluation.clarityScore}
                />

                <ComparisonRow
                  label="Cut"
                  first={firstEvaluation.cutScore}
                  second={secondEvaluation.cutScore}
                />

                <ComparisonRow
                  label="Carat Weight"
                  first={firstEvaluation.caratScore}
                  second={secondEvaluation.caratScore}
                  last
                />
              </div>
            </div>
          </div>

          {/* Plain-Language Comparison Summary */}
          <ComparisonSummary
            first={firstEvaluation}
            second={secondEvaluation}
          />

          {/* Value & Supporting Information Table */}
          <div className="space-y-4">
            <div className="rounded-2xl bg-[var(--surface-soft)] p-5">
              <h3 className="font-bold">
                Value & Supporting Information Comparison
              </h3>

              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Compare physical parameters, market price estimates, treatment, origin, and information source reliability side by side.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-white">
              <div className="min-w-[600px]">
                <div className="grid grid-cols-[1fr_1fr_1fr] bg-[var(--surface-soft)]">
                  <div className="p-4 text-sm font-semibold text-[var(--muted)]">
                    Parameter
                  </div>

                  <GemstoneHeading evaluation={firstEvaluation} />

                  <GemstoneHeading evaluation={secondEvaluation} />
                </div>

                <ValueComparisonRow
                  label="Carat Weight"
                  first={firstEvaluation.caratWeight}
                  second={secondEvaluation.caratWeight}
                />

                <ValueComparisonRow
                  label="Treatment"
                  first={firstEvaluation.treatmentStatus}
                  second={secondEvaluation.treatmentStatus}
                />

                <ValueComparisonRow
                  label="Origin"
                  first={firstEvaluation.originValue}
                  second={secondEvaluation.originValue}
                />

                <ValueComparisonRow
                  label="Suggested B2B Price"
                  first={firstEvaluation.suggestedPriceText}
                  second={secondEvaluation.suggestedPriceText}
                />

                <ValueComparisonRow
                  label="Price Range"
                  first={firstEvaluation.priceRangeText}
                  second={secondEvaluation.priceRangeText}
                />

                <ValueComparisonRow
                  label="Measurement Information"
                  first={firstEvaluation.measurementReliability}
                  second={secondEvaluation.measurementReliability}
                />

                <ValueComparisonRow
                  label="Treatment Information"
                  first={firstEvaluation.treatmentReliability}
                  second={secondEvaluation.treatmentReliability}
                />

                <ValueComparisonRow
                  label="Origin Information"
                  first={firstEvaluation.originReliability}
                  second={secondEvaluation.originReliability}
                  last
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border)] p-4">
            <p className="text-sm leading-6 text-[var(--muted)]">
              <strong className="text-[var(--foreground)]">
                How should I read this?
              </strong>{" "}
              These values let you compare how two saved evaluations scored
              under the same type of rule-based assessment. They do not by
              themselves determine which gemstone is more valuable, more
              authentic, or professionally graded as better.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function EvaluationSelector({
  label,
  value,
  onChange,
  evaluations,
  disabledId,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  evaluations: EvaluationOption[];
  disabledId: string;
}) {
  return (
    <div>
      <label className="font-semibold">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 outline-none focus:border-[var(--primary)] text-sm"
      >
        <option value="">
          Select a saved evaluation
        </option>

        {evaluations.map((evaluation) => (
          <option
            key={evaluation._id}
            value={evaluation._id}
            disabled={evaluation._id === disabledId}
          >
            {evaluation.variety} — {formatDate(evaluation.createdAt)} —{" "}
            {formatScore(evaluation.overallScore)}/100
          </option>
        ))}
      </select>
    </div>
  );
}

function GemstoneHeading({
  evaluation,
}: {
  evaluation: EvaluationOption;
}) {
  return (
    <div className="border-l border-[var(--border)] p-4">
      <p className="font-bold">
        {evaluation.variety}
      </p>

      <p className="mt-1 text-xs text-[var(--muted)]">
        {formatDate(evaluation.createdAt)}
      </p>
    </div>
  );
}

function ComparisonSummary({
  first,
  second,
}: {
  first: EvaluationOption;
  second: EvaluationOption;
}) {
  const differences = buildComparisonDifferences(first, second);

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
      <div>
        <p className="text-sm font-semibold text-[var(--primary)]">
          Quick Explanation
        </p>

        <h3 className="mt-1 text-lg font-bold">
          What is different between these evaluations?
        </h3>

        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          This summary highlights noticeable differences in the saved
          evaluation information. It does not choose a better gemstone.
        </p>
      </div>

      {differences.length > 0 ? (
        <div className="mt-5 space-y-3">
          {differences.map((difference, index) => (
            <div
              key={`${difference}-${index}`}
              className="flex gap-3 rounded-xl bg-[var(--surface-soft)] p-4"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-[var(--primary-dark)]">
                {index + 1}
              </div>

              <p className="text-sm leading-6 text-[var(--foreground)]">
                {difference}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-xl bg-[var(--surface-soft)] p-4">
          <p className="text-sm leading-6 text-[var(--muted)]">
            No differences were found in the information included in
            this comparison.
          </p>
        </div>
      )}
    </div>
  );
}

function buildComparisonDifferences(
  first: EvaluationOption,
  second: EvaluationOption
) {
  const differences: string[] = [];

  const firstLabel = `${first.variety} (${formatDate(first.createdAt)})`;
  const secondLabel = `${second.variety} (${formatDate(second.createdAt)})`;

  addScoreDifference(
    differences,
    "Color",
    first.colorScore,
    second.colorScore,
    firstLabel,
    secondLabel
  );

  addScoreDifference(
    differences,
    "Clarity",
    first.clarityScore,
    second.clarityScore,
    firstLabel,
    secondLabel
  );

  addScoreDifference(
    differences,
    "Cut",
    first.cutScore,
    second.cutScore,
    firstLabel,
    secondLabel
  );

  addScoreDifference(
    differences,
    "Carat Weight",
    first.caratScore,
    second.caratScore,
    firstLabel,
    secondLabel
  );

  if (first.caratWeight !== second.caratWeight) {
    differences.push(
      `${firstLabel} is ${first.caratWeight}, while ${secondLabel} is ${second.caratWeight}.`
    );
  }

  if (
    normalizeValue(first.treatmentStatus) !==
    normalizeValue(second.treatmentStatus)
  ) {
    differences.push(
      `The treatment information is different: ${formatValue(first.treatmentStatus)} compared with ${formatValue(second.treatmentStatus)}.`
    );
  }

  if (
    normalizeValue(first.originValue) !==
    normalizeValue(second.originValue)
  ) {
    differences.push(
      `The recorded origin information is different: ${formatValue(first.originValue)} compared with ${formatValue(second.originValue)}.`
    );
  }

  return differences;
}

function addScoreDifference(
  differences: string[],
  label: string,
  firstScore: number,
  secondScore: number,
  firstName: string,
  secondName: string
) {
  if (firstScore === secondScore) {
    return;
  }

  if (firstScore > secondScore) {
    differences.push(
      `${firstName} received a higher ${label} score in these evaluations (${formatScore(firstScore)} compared with ${formatScore(secondScore)}).`
    );
    return;
  }

  differences.push(
    `${secondName} received a higher ${label} score in these evaluations (${formatScore(secondScore)} compared with ${formatScore(firstScore)}).`
  );
}

function normalizeValue(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function formatValue(value: string | null | undefined) {
  if (!value || value.trim() === "") return "Unknown";
  return value;
}

function ComparisonRow({
  label,
  first,
  second,
  last = false,
}: {
  label: string;
  first: number;
  second: number;
  last?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-[1fr_1fr_1fr] ${
        last ? "" : "border-b border-[var(--border)]"
      }`}
    >
      <div className="p-4 text-sm font-semibold">
        {label}
      </div>

      <ScoreCell score={first} />

      <ScoreCell score={second} />
    </div>
  );
}

function ValueComparisonRow({
  label,
  first,
  second,
  last = false,
}: {
  label: string;
  first: string;
  second: string;
  last?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-[1fr_1fr_1fr] ${
        last ? "" : "border-b border-[var(--border)]"
      }`}
    >
      <div className="p-4 text-sm font-semibold">
        {label}
      </div>

      <div className="border-l border-[var(--border)] p-4 text-sm font-medium text-[var(--foreground)]">
        {first}
      </div>

      <div className="border-l border-[var(--border)] p-4 text-sm font-medium text-[var(--foreground)]">
        {second}
      </div>
    </div>
  );
}

function ScoreCell({
  score,
}: {
  score: number;
}) {
  const safeScore = Math.max(0, Math.min(100, score));

  return (
    <div className="border-l border-[var(--border)] p-4">
      <p className="font-bold text-[var(--primary-dark)]">
        {formatScore(score)}
        <span className="text-xs font-normal text-[var(--muted)]">
          {" "}/ 100
        </span>
      </p>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--surface-soft)]">
        <div
          className="h-full rounded-full bg-[var(--primary)]"
          style={{ width: `${safeScore}%` }}
        />
      </div>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function formatScore(value: number) {
  return Number.isInteger(value)
    ? value.toString()
    : value.toFixed(1);
}
