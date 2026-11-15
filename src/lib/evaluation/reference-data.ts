import type { SriLankanReference } from "./types";

// No scraped reports or existing database records are implicitly accepted as reviewed references.
// This separate dataset stays empty until source, quality, and reuse checks are recorded.
export const SRI_LANKAN_REFERENCES: readonly SriLankanReference[] = [];
