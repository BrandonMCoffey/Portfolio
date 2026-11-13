export interface NavLinkItem {
  id: string;
  href: string;
  text: string;
  isPage: boolean;
  pageHref: string;
}

export const SITE_PROFILE = {
  name: "Brandon Coffey",
  initials: "BC",
  roleShort: "Technical Artist",
  roleFull: "Lead Technical Artist & Graphics / XR Programmer",
  researchRole: "Lead Technical Artist & Graphics / XR Researcher",
  heroSubtitle: "UT Dallas MFA • VAST Lab",
  affiliation: "The University of Texas at Dallas • VAST Lab (Virtual Reality, Augmented Reality, Simulation, Technology)",
  location: "Dallas-Fort Worth, TX",
  avatar: "/profile-picture.png",
  email: "business@brandoncoffey.com",
  github: {
    url: "https://github.com/BrandonMCoffey",
    display: "github.com/BrandonMCoffey",
    label: "GitHub",
  },
  linkedin: {
    url: "https://www.linkedin.com/in/brandon-coffey-36a802191",
    display: "linkedin.com/in/brandon-coffey",
    label: "LinkedIn",
  },
  orcid: {
    id: "0000-0002-3892-0844",
    url: "https://orcid.org/0000-0002-3892-0844",
    display: "orcid.org/0000-0002-3892-0844",
    label: "ORCID Profile",
  },
} as const;

export const PORTFOLIO_NAV_LINKS: NavLinkItem[] = [
  { id: "home", href: "home", text: "Home", isPage: false, pageHref: "/" },
  { id: "projects", href: "projects", text: "Projects", isPage: true, pageHref: "/projects" },
  { id: "cv", href: "cv", text: "CV & Research", isPage: true, pageHref: "/cv" },
  { id: "experience", href: "experience", text: "Experience", isPage: false, pageHref: "/#experience" },
  { id: "about", href: "about", text: "About", isPage: false, pageHref: "/#about" },
  { id: "contact", href: "contact", text: "Contact", isPage: false, pageHref: "/#contact" },
];

export const HEADER_UI_TEXT = {
  menuToggleAriaLabel: "Toggle navigation menu",
} as const;

export const FOOTER_CONTENT = {
  portfolio: {
    links: [
      { label: "Portfolio", href: "/" },
      { label: "All Projects", href: "/projects" },
      { label: "Curriculum Vitae", href: "/cv" },
      { label: "Contact", href: "/#contact" },
    ],
  },
  cookbook: {
    links: [
      { label: "All Recipes", href: "/cookbook" },
      { label: "Favorites", href: "/cookbook/favorites" },
      { label: "Shopping List", href: "/cookbook/shopping-list" },
      { label: "Diagnostics", href: "/cookbook/data" },
    ],
  },
  copyrightAttribution: "Crafted with Astro 7 & Tailwind CSS v4.",
} as const;

export const COOKBOOK_SITE = {
  brandName: "Coffey Cookbook",
  subtitle: "Culinary Archive",
  footerTagline: "Curated Culinary & Recipe Archive",
  metaDescription: "A curated personal recipe archive.",
  menuToggleAriaLabel: "Toggle cookbook menu",
  navLinks: {
    allRecipes: { label: "All Recipes", href: "/cookbook" },
    favorites: { label: "Favorites", href: "/cookbook/favorites" },
    shoppingList: { label: "Shopping List", href: "/cookbook/shopping-list" },
  },
} as const;

export const UI_COMMON_TEXT = {
  scrollToTopAriaLabel: "Scroll to top of page",
  scrollToTopTitle: "Scroll to top",
  themeToggleAriaLabel: "Toggle theme",
} as const;

// Replace {key} placeholders in a template string with provided values.
export function formatTemplate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => (key in values ? String(values[key]) : match));
}
