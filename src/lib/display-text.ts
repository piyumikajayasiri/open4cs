// Presentation only. Stored provenance, identifiers, API values and rule keys stay unchanged.
export function displayText(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/mock(?=$|[\s_\-:])/gi, (word) => word === "MOCK" ? "SAMPLE" : word === "Mock" ? "Sample" : "sample")
    .replace(/;\s*/g, ". ");
}
