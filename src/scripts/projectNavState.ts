/**
 * Manages temporary project navigation origin ("home" vs "projects"),
 * All Projects explorer filter/sort state, and instant return-scroll restoration
 * when navigating back from project detail pages.
 */

export interface ProjectsExplorerState {
  category: string;
  tech: string;
  search: string;
  sort: string;
}

export interface ReturnScrollState {
  pathname: string;
  scrollY: number;
}

const ORIGIN_KEY = "portfolio_project_origin";
const EXPLORER_KEY = "portfolio_projects_explorer";
const RETURN_SCROLL_KEY = "portfolio_return_scroll";

export function normalizePath(path: string): string {
  if (!path || path === "/") return "/";
  return path.replace(/\/+$/, "") || "/";
}

export function isProjectDetailPath(path: string): boolean {
  const norm = normalizePath(path);
  return (
    norm.startsWith("/projects/") ||
    norm.startsWith("/cv/publications/") ||
    norm.startsWith("/cv/media/")
  );
}

export function setProjectOrigin(origin: "home" | "projects") {
  try {
    sessionStorage.setItem(ORIGIN_KEY, origin);
  } catch {
    // Ignore storage errors
  }
}

export function getProjectOrigin(): "home" | "projects" | null {
  try {
    const val = sessionStorage.getItem(ORIGIN_KEY);
    return val === "home" || val === "projects" ? val : null;
  } catch {
    return null;
  }
}

export function saveProjectsExplorerState(state: ProjectsExplorerState) {
  try {
    sessionStorage.setItem(EXPLORER_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors
  }
}

export function loadProjectsExplorerState(): ProjectsExplorerState | null {
  try {
    const raw = sessionStorage.getItem(EXPLORER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ProjectsExplorerState>;
    return {
      category: typeof parsed.category === "string" ? parsed.category : "all",
      tech: typeof parsed.tech === "string" ? parsed.tech : "",
      search: typeof parsed.search === "string" ? parsed.search : "",
      sort: typeof parsed.sort === "string" ? parsed.sort : "priority_asc",
    };
  } catch {
    return null;
  }
}

export function saveReturnScroll(pathname: string, scrollY: number) {
  try {
    const payload: ReturnScrollState = {
      pathname: normalizePath(pathname),
      scrollY: Math.max(0, Math.round(scrollY)),
    };
    sessionStorage.setItem(RETURN_SCROLL_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage errors
  }
}

export function getReturnScrollFor(pathname: string): number | null {
  try {
    const raw = sessionStorage.getItem(RETURN_SCROLL_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ReturnScrollState>;
    if (typeof parsed.pathname === "string" && typeof parsed.scrollY === "number") {
      if (normalizePath(parsed.pathname) === normalizePath(pathname)) {
        return parsed.scrollY;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function clearReturnScroll() {
  try {
    sessionStorage.removeItem(RETURN_SCROLL_KEY);
  } catch {
    // Ignore storage errors
  }
}

export function applyInstantScroll(y: number) {
  const html = document.documentElement;
  const prevBehavior = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto";
  window.scrollTo({ top: y, left: 0, behavior: "instant" as ScrollBehavior });
  requestAnimationFrame(() => {
    html.style.scrollBehavior = prevBehavior;
  });
}

export function restoreReturnScroll(consume: boolean) {
  const targetY = getReturnScrollFor(window.location.pathname);
  if (targetY === null) return;
  applyInstantScroll(targetY);
  if (consume) {
    clearReturnScroll();
  }
}

export function clearProjectNavigationState() {
  try {
    sessionStorage.removeItem(ORIGIN_KEY);
    sessionStorage.removeItem(EXPLORER_KEY);
    sessionStorage.removeItem(RETURN_SCROLL_KEY);
  } catch {
    // Ignore storage errors
  }
}
