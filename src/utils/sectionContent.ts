import { getEntry, render, type CollectionEntry } from "astro:content";
import { SITE_PROFILE } from "../data/site";

type SectionEntry = CollectionEntry<"sections">;
type SectionKind = SectionEntry["data"]["section"];
type SectionDataFor<K extends SectionKind> = Extract<SectionEntry["data"], { section: K }>;

// Fetch and render a typed entry from the sections content collection.
export async function loadSectionContent<K extends SectionKind>(id: K) {
  const entry = await getEntry("sections", id);
  if (!entry || entry.data.section !== id) {
    throw new Error(`Missing or mismatched section content entry: "${id}"`);
  }
  const rendered = await render(entry);
  return {
    data: entry.data as SectionDataFor<K>,
    Content: rendered.Content,
    headings: rendered.headings,
  };
}

// Resolve a CTA item's href and target using centralized profile links.
export function resolveCtaLink(cta: { href?: string; type?: "email" | "linkedin" | "github" }) {
  if (cta.type === "email") {
    return { href: `mailto:${SITE_PROFILE.email}`, isExternal: false };
  }
  if (cta.type === "linkedin") {
    return { href: SITE_PROFILE.linkedin.url, isExternal: true };
  }
  if (cta.type === "github") {
    return { href: SITE_PROFILE.github.url, isExternal: true };
  }
  return { href: cta.href || "#", isExternal: Boolean(cta.href?.startsWith("http")) };
}
