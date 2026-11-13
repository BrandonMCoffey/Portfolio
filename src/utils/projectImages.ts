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

export function resolveProjectSlugFromUrl(pathname: string): string {
  if (!pathname) return "";

  const cleanPath = pathname.replace(/\/+$/, "");

  const projectMatch = cleanPath.match(/\/projects\/([^/]+)$/);
  if (projectMatch) {
    return projectMatch[1];
  }

  const pubMatch = cleanPath.match(/\/cv\/publications\/([^/]+)$/);
  if (pubMatch) {
    const pubId = pubMatch[1];
    const pub = publications.find((p) => p.id === pubId);
    if (pub?.projectSlug) {
      return pub.projectSlug;
    }
  }

  const mediaMatch = cleanPath.match(/\/cv\/media\/([^/]+)$/);
  if (mediaMatch) {
    const mediaId = mediaMatch[1];
    const media = mediaRecognition.find((m) => m.id === mediaId);
    if (media?.projectSlug) {
      return media.projectSlug;
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
