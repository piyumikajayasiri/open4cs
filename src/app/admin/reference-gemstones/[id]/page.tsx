"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Pencil,
  Gem,
  CalendarDays,
  CheckCircle2,
  XCircle,
  LoaderCircle,
} from "lucide-react";

type Gemstone = {
  _id: string;
  code?: string;
  name?: string;
  species?: string;
  supportedOrigin?: string;
  supportedShapes?: string[];
};

type ReferenceGemstone = {
  _id: string;
  referenceId: string;
  gemstoneId: Gemstone | string;

  origin?: string;
  originVerification?: string;

  color?: string;
  clarity?: string;
  cut?: string;
  caratWeight?: number;

  treatment?: string;
  treatmentVerification?: string;

  referencePrice?: number;
  pricePerCarat?: number;
  priceCurrency?: string;

  verificationStatus?: string;
  source?: string;
  notes?: string;

  status: "ACTIVE" | "INACTIVE";
  createdAt?: string;
  updatedAt?: string;
};

function display(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return "Not provided";
  }

  return String(value);
}

function formatDate(value?: string) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleString();
}

function formatMoney(value?: number, currency?: string) {
  if (value === undefined || value === null) {
    return "Not provided";
  }

  return `${display(currency || "Currency not specified")} ${value.toLocaleString(
    undefined,
    { maximumFractionDigits: 2 },
  )}`;
}

export default function ViewReferenceGemstonePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [reference, setReference] = useState<ReferenceGemstone | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function loadReference() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/admin/reference-gemstones/${id}`, {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load reference gemstone.");
        }

        if (!cancelled) {
          setReference(data.reference);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong while loading the record.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadReference();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const gemstone =
    reference?.gemstoneId && typeof reference.gemstoneId === "object"
      ? reference.gemstoneId
      : null;

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-center justify-center gap-3 py-20 text-slate-500">
          <LoaderCircle className="h-5 w-5 animate-spin" />
          Loading reference gemstone...
        </div>
      </main>
    );
  }

  if (error || !reference) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Link
          href="/admin/reference-gemstones"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Reference Gemstones
        </Link>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h1 className="font-semibold text-red-800">
            Unable to load reference gemstone
          </h1>
          <p className="mt-2 text-sm text-red-700">
            {error || "Reference gemstone not found."}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      {/* Header */}
      <Link
        href="/admin/reference-gemstones"
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Reference Gemstones
      </Link>

      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-medium text-slate-500">
            CAGS Administration / Reference Gemstones
          </p>

          <div className="mt-2 flex items-center gap-3">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <Gem className="h-7 w-7 text-slate-700" />
            </div>

            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                {reference.referenceId}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {display(gemstone?.name)}
                {gemstone?.code ? ` · ${gemstone.code}` : ""}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${
              reference.status === "ACTIVE"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {reference.status === "ACTIVE" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            {reference.status}
          </span>

          <Link
            href={`/admin/reference-gemstones/${id}/edit`}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <Pencil className="h-4 w-4" />
            Edit Reference
          </Link>
        </div>
      </div>

      {/* Catalogue Information */}
      <Section
        title="Gemstone Information"
        description="The catalogue variety associated with this reference record."
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Detail label="Reference ID" value={reference.referenceId} />
          <Detail label="Variety" value={gemstone?.name} />
          <Detail label="Internal Code" value={gemstone?.code} />
          <Detail label="Species" value={gemstone?.species} />
          <Detail label="Origin" value={reference.origin} />
          <Detail
            label="Origin Verification"
            value={reference.originVerification}
          />
          <Detail label="Supported Origin" value={gemstone?.supportedOrigin} />
          <Detail
            label="Supported Shapes"
            value={gemstone?.supportedShapes?.join(", ")}
          />
        </div>
      </Section>

      {/* 4C Details */}
      <Section
        title="4C Characteristics"
        description="Recorded characteristics of the reference gemstone."
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Detail label="Color" value={reference.color} />
          <Detail label="Clarity" value={reference.clarity} />
          <Detail label="Cut" value={reference.cut} />
          <Detail
            label="Carat Weight"
            value={
              reference.caratWeight !== undefined
                ? `${reference.caratWeight} ct`
                : undefined
            }
          />
        </div>
      </Section>

      {/* Treatment */}
      <Section
        title="Treatment Information"
        description="Treatment details and available verification information."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Detail label="Treatment" value={reference.treatment} />
          <Detail
            label="Treatment Verification"
            value={reference.treatmentVerification}
          />
        </div>
      </Section>

      {/* Pricing */}
      <Section
        title="Reference Pricing"
        description="Recorded reference prices for comparison and future analysis."
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Detail
            label="Reference Price"
            value={formatMoney(
              reference.referencePrice,
              reference.priceCurrency,
            )}
          />
          <Detail
            label="Price per Carat"
            value={formatMoney(
              reference.pricePerCarat,
              reference.priceCurrency,
            )}
          />
          <Detail label="Currency" value={reference.priceCurrency} />
        </div>
      </Section>

      {/* Verification */}
      <Section
        title="Verification & Source"
        description="Provenance of the record and its verification details."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Detail
            label="Verification Status"
            value={reference.verificationStatus}
          />
          <Detail label="Source" value={reference.source} />
          <div className="sm:col-span-2">
            <Detail label="Notes" value={reference.notes} />
          </div>
        </div>
      </Section>

      {/* Record Metadata */}
      <Section title="Record Information">
        <div className="grid gap-5 sm:grid-cols-2">
          <Detail
            label="Created"
            value={formatDate(reference.createdAt)}
            icon={<CalendarDays className="h-4 w-4" />}
          />
          <Detail
            label="Last Updated"
            value={formatDate(reference.updatedAt)}
            icon={<CalendarDays className="h-4 w-4" />}
          />
        </div>
      </Section>

      <div className="flex justify-end pb-8">
        <Link
          href="/admin/reference-gemstones"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back to Reference Gemstones
        </Link>
      </div>
    </main>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>

      <div className="p-6">{children}</div>
    </section>
  );
}

function Detail({
  label,
  value,
  icon,
}: {
  label: string;
  value?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  const isEmpty = value === undefined || value === null || value === "";

  return (
    <div className="min-w-0">
      <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {icon}
        {label}
      </p>

      <div className="whitespace-pre-wrap break-words text-sm font-medium leading-6 text-slate-900">
        {isEmpty ? "Not provided" : value}
      </div>
    </div>
  );
}
