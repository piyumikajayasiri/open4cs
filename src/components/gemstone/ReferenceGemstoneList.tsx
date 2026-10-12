"use client";

export type ReferenceGemstoneItem = {
  _id: string;
  variety: string;
  caratWeight: number;
  referencePrice: number;
  currency?: string;

  cut?: {
    length?: number | null;
    width?: number | null;
    depth?: number | null;
  };
};

type ReferenceGemstoneListProps = {
  references: ReferenceGemstoneItem[];
};

export default function ReferenceGemstoneList({
  references,
}: ReferenceGemstoneListProps) {
  return (
    <section>
      <h2>Reference Gemstones</h2>

      {references.length === 0 ? (
        <p>No reference gemstones available.</p>
      ) : (
        references.map((reference) => (
          <div key={reference._id}>
            <p>Variety: {reference.variety}</p>

            <p>
              Carat Weight: {reference.caratWeight}
            </p>

            <p>
              Reference Price:{" "}
              {reference.currency ?? "Unknown"}{" "}
              {reference.referencePrice}
            </p>

            <p>
              Dimensions:{" "}
              {reference.cut?.length != null &&
              reference.cut?.width != null &&
              reference.cut?.depth != null
                ? `${reference.cut.length} × ${reference.cut.width} × ${reference.cut.depth}`
                : "Unavailable"}
            </p>

            <hr />
          </div>
        ))
      )}
    </section>
  );
}
