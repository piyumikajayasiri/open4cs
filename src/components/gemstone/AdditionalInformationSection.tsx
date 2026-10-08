import { useEffect, useState } from "react";

interface RegistryOption {
  _id: string;
  name: string;
  description?: string;
}

type AdditionalInformationSectionProps = {
  treatmentStatus: string;
  treatmentType: string;
  originValue: string;
  originReliability: string;
  informationReliability: {
    measurements: string;
    treatment: string;
    origin: string;
  };
  onTreatmentStatusChange: (value: string) => void;
  onTreatmentTypeChange: (value: string) => void;
  onOriginValueChange: (value: string) => void;
  onOriginReliabilityChange: (value: string) => void;
  onInformationReliabilityChange: (
    field: "measurements" | "treatment" | "origin",
    value: string
  ) => void;
};

export default function AdditionalInformationSection({
  treatmentStatus,
  treatmentType,
  originValue,
  originReliability,
  informationReliability,
  onTreatmentStatusChange,
  onTreatmentTypeChange,
  onOriginValueChange,
  onOriginReliabilityChange,
  onInformationReliabilityChange,
}: AdditionalInformationSectionProps) {
  const [treatmentOptions, setTreatmentOptions] = useState<RegistryOption[]>([]);
  const [originOptions, setOriginOptions] = useState<RegistryOption[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState("");

  useEffect(() => {
    async function loadOptions() {
      try {
        setOptionsLoading(true);
        setOptionsError("");

        const response = await fetch("/api/gemstone-options");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to load gemstone options."
          );
        }

        setTreatmentOptions(data.treatments ?? []);
        setOriginOptions(data.origins ?? []);
      } catch (error) {
        console.error("Failed to load gemstone options:", error);

        setOptionsError(
          error instanceof Error
            ? error.message
            : "Unable to load gemstone options."
        );
      } finally {
        setOptionsLoading(false);
      }
    }

    loadOptions();
  }, []);

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-7">
        <span className="inline-flex rounded-full bg-[var(--primary-soft)] px-3 py-1 text-sm font-semibold text-[var(--primary-dark)]">
          Step 5
        </span>

        <h2 className="mt-3 text-2xl font-bold">
          A few more details
        </h2>

        <p className="mt-2 max-w-2xl leading-7 text-[var(--muted)]">
          Treatment, origin, and the reliability of your information can
          provide useful additional context for the evaluation.
        </p>
      </div>

      <div className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
        <p className="font-semibold">
          💡 It&apos;s okay if you don&apos;t know
        </p>

        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Some gemstone information cannot be reliably determined just by
          looking at the stone. If you do not have reliable information,
          choose an Unknown or Unverified option where available instead of
          guessing.
        </p>
      </div>

      {optionsError && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {optionsError} Please refresh the page and try again.
        </div>
      )}

      <div className="space-y-8">
        {/* Treatment Status */}
        <div>
          <label htmlFor="treatment-status" className="block text-base font-semibold">
            Has the gemstone received treatment?
          </label>

          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            Treatment means a process may have been used to alter or improve
            characteristics of the gemstone.
          </p>

          <p className="mt-2 text-sm font-medium text-[var(--primary-dark)]">
            If you have no reliable treatment information, choose Unknown.
          </p>

          <select
            id="treatment-status"
            value={treatmentStatus}
            onChange={(e) => onTreatmentStatusChange(e.target.value)}
            disabled={optionsLoading}
            className="mt-3 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <option value="">
              {optionsLoading
                ? "Loading treatment options..."
                : "Select treatment information"}
            </option>
            {treatmentOptions.map((option) => (
              <option key={option._id} value={option.name}>
                {option.name}
              </option>
            ))}
          </select>
        </div>

        {/* Treatment Type */}
        <div>
          <label htmlFor="treatment-type" className="block text-base font-semibold">
            Treatment Type (Optional)
          </label>

          <p className="mt-1 text-sm text-[var(--muted)]">
            If known, enter specific treatment details (e.g. Traditional Heating).
          </p>

          <input
            id="treatment-type"
            type="text"
            value={treatmentType}
            onChange={(event) => onTreatmentTypeChange(event.target.value)}
            placeholder="Enter treatment type"
            className="mt-3 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)]"
          />
        </div>

        {/* Origin */}
        <div>
          <label htmlFor="origin-value" className="block text-base font-semibold">
            Do you know the gemstone&apos;s geographic origin?
          </label>

          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            Origin refers to the geographic source associated with the
            gemstone, such as Sri Lanka, Myanmar, or Madagascar.
          </p>

          <p className="mt-2 text-sm font-medium text-[var(--primary-dark)]">
            If the origin has not been reliably established, choose Unknown.
          </p>

          <select
            id="origin-value"
            value={originValue}
            onChange={(e) => onOriginValueChange(e.target.value)}
            disabled={optionsLoading}
            className="mt-3 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <option value="">
              {optionsLoading
                ? "Loading origin options..."
                : "Select reported origin"}
            </option>
            {originOptions.map((option) => (
              <option key={option._id} value={option.name}>
                {option.name}
              </option>
            ))}
          </select>
        </div>

        {/* Origin Reliability */}
        <div>
          <label htmlFor="origin-reliability" className="block text-base font-semibold">
            How confident are you about the origin information?
          </label>

          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            Tell us how reliable you believe the origin information is.
          </p>

          <select
            id="origin-reliability"
            value={originReliability}
            onChange={(e) => onOriginReliabilityChange(e.target.value)}
            className="mt-3 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)]"
          >
            <option value="">Select origin reliability</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
            <option value="Unknown">Unknown</option>
          </select>
        </div>

        {/* Information Reliability section header */}
        <div className="border-t border-[var(--border)] pt-8">
          <h3 className="text-lg font-bold">
            Where did your information come from?
          </h3>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Knowing the source of the information helps communicate how much
            confidence should be placed in it.
          </p>
        </div>

        <div>
          <label htmlFor="info-rel-measurements" className="block text-sm font-semibold">
            How were the gemstone&apos;s measurements obtained?
          </label>

          <select
            id="info-rel-measurements"
            value={informationReliability.measurements}
            onChange={(e) =>
              onInformationReliabilityChange(
                "measurements",
                e.target.value
              )
            }
            className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)]"
          >
            <option value="Measured">Measured</option>
            <option value="User Observed">User Observed</option>
            <option value="Seller Provided">Seller Provided</option>
            <option value="Laboratory Verified">Laboratory Verified</option>
            <option value="Unverified">Unverified</option>
          </select>
        </div>

        <div>
          <label htmlFor="info-rel-treatment" className="block text-sm font-semibold">
            Where did the treatment information come from?
          </label>

          <select
            id="info-rel-treatment"
            value={informationReliability.treatment}
            onChange={(e) =>
              onInformationReliabilityChange(
                "treatment",
                e.target.value
              )
            }
            className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)]"
          >
            <option value="Measured">Measured</option>
            <option value="User Observed">User Observed</option>
            <option value="Seller Provided">Seller Provided</option>
            <option value="Laboratory Verified">Laboratory Verified</option>
            <option value="Unverified">Unverified</option>
          </select>
        </div>

        <div>
          <label htmlFor="info-rel-origin" className="block text-sm font-semibold">
            Where did the origin information come from?
          </label>

          <select
            id="info-rel-origin"
            value={informationReliability.origin}
            onChange={(e) =>
              onInformationReliabilityChange(
                "origin",
                e.target.value
              )
            }
            className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)]"
          >
            <option value="Measured">Measured</option>
            <option value="User Observed">User Observed</option>
            <option value="Seller Provided">Seller Provided</option>
            <option value="Laboratory Verified">Laboratory Verified</option>
            <option value="Unverified">Unverified</option>
          </select>
        </div>

        {/* Reliability explanation footer */}
        <div className="rounded-xl border border-[var(--border)] p-4">
          <p className="font-semibold">
            Understanding information reliability
          </p>

          <div className="mt-3 space-y-2 text-sm text-[var(--muted)]">
            <p>
              <strong className="text-[var(--foreground)]">Measured:</strong>{" "}
              obtained through a measurement.
            </p>

            <p>
              <strong className="text-[var(--foreground)]">User observed:</strong>{" "}
              based on what you personally observed.
            </p>

            <p>
              <strong className="text-[var(--foreground)]">Seller provided:</strong>{" "}
              information supplied by a seller or another source.
            </p>

            <p>
              <strong className="text-[var(--foreground)]">Laboratory verified:</strong>{" "}
              supported by laboratory information.
            </p>

            <p>
              <strong className="text-[var(--foreground)]">Unverified:</strong>{" "}
              the information has not been independently confirmed.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
