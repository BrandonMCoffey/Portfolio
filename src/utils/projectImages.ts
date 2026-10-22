import { publications, mediaRecognition } from "../data/cvData";

export function resolveProjectThumbnail(slug: string, thumbnail?: string): string {
  if (!thumbnail || thumbnail.trim() === "") {
    return `/images/projects/${slug}/thumbnail.jpg`;
  }
  const trimmed = thumbnail.trim();
  if (trimmed.startsWith("/") || trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `/images/projects/${slug}/${trimmed}`;
}

const legacyPrefixMap: Record<string, string> = {
  "faa-techops": "vast-faa-techops",
  "ackerman-digital-twin": "utd-ackerman-center",
  "tulsa-union": "vast-tulsa-union",
  woodbearers: "vast-woodbearers",
  "kitty-city": "vast-kitty-city",
  "utd-campus": "utd-atc-building",
  "meta-twin": "milab-meta-twin",
  "scivis-haptics": "milab-scivis-haptics",
  vivarium: "utd-vivarium",
  "multicultural-mural": "vast-multicultural-mural",
  "wind-visualization": "milab-wind-visualization",
};

export function resolveProjectSlugFromUrl(pathname: string): string {
  if (!pathname) return "";

  // Normalize pathname: remove trailing slash
  const cleanPath = pathname.replace(/\/+$/, "");

  // Check /projects/{slug}
  const projectMatch = cleanPath.match(/\/projects\/([^/]+)$/);
  if (projectMatch) {
    const slug = projectMatch[1];
    return legacyPrefixMap[slug] || slug;
  }

  // Check /cv/publications/{id}
  const pubMatch = cleanPath.match(/\/cv\/publications\/([^/]+)$/);
  if (pubMatch) {
    const pubId = pubMatch[1];
    const pub = publications.find((p) => p.id === pubId);
    if (pub?.projectSlug) {
      return legacyPrefixMap[pub.projectSlug] || pub.projectSlug;
    }
  }

  // Check /cv/media/{id}
  const mediaMatch = cleanPath.match(/\/cv\/media\/([^/]+)$/);
  if (mediaMatch) {
    const mediaId = mediaMatch[1];
    const media = mediaRecognition.find((m) => m.id === mediaId);
    if (media?.projectSlug) {
      return legacyPrefixMap[media.projectSlug] || media.projectSlug;
    }
  }

  return "";
}

export function resolveProjectImage(file: string, pathname: string, explicitSlug?: string): string {
  if (!file) return "";

  const trimmed = file.trim();
  if (trimmed.startsWith("/") || trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  if (trimmed.includes("/")) {
    return `/images/projects/${trimmed}`;
  }

  const slug = explicitSlug || resolveProjectSlugFromUrl(pathname);
  if (slug) {
    return `/images/projects/${slug}/${trimmed}`;
  }

  return `/images/projects/${trimmed}`;
}
