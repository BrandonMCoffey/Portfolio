export const PROJECT_SETTINGS = {
	// Show the featured thumbnail banner at the top of individual project detail pages.
	showDetailThumbnail: false,
	// Make software & tech stack tags on project detail pages clickable external links.
	enableTechStackLinks: false
} as const;

export interface ProjectFilterDefinition {
	id: string;
	label: string;
	// Frontmatter filter tags matched by this category (defaults to [id]).
	matchTags?: string[];
}

export const PROJECT_FILTER_DEFINITIONS: ProjectFilterDefinition[] = [
	{ id: "all", label: "All Projects" },
	{ id: "game", label: "Games" },
	{ id: "VR", label: "VR / AR", matchTags: ["VR", "AR"] },
	{ id: "graphics", label: "Graphics" },
	{ id: "utility", label: "Tools" },
	{ id: "vastlab", label: "VAST Lab" },
	{ id: "gamelab", label: "Game Lab" },
	{ id: "milab", label: "MI Lab" }
];

// Optional external website URLs shown under the active filter title on /projects.
export const PROJECT_FILTER_WEBSITE_URLS: Record<string, string> = {
	vastlab: "https://vastlab.com",
	gamelab: "https://www.atec-animgames.com/game-lab",
	milab: "https://mi-lab.io/"
};

export const POPULAR_PROJECT_TECH = ["Unreal", "Unity", "C#", "Python", "Maya", "Houdini", "Blender"] as const;

export const PROJECT_SORT_OPTIONS = [
	{ value: "priority_asc", label: "Default" },
	{ value: "year_desc", label: "Year (Newest First)" },
	{ value: "year_asc", label: "Year (Oldest First)" },
	{ value: "title_asc", label: "Title (A → Z)" }
] as const;

// Hostnames treated as interactive live demos in ProjectLayout action CTAs.
export const INTERACTIVE_DEMO_HOSTS = ["spatial.io", "github.io", "vercel.app", "itch.io"] as const;

export const PROJECT_LAYOUT_TEXT = {
	defaultBackLink: { href: "/projects", label: "Back to All Projects" },
	cvMediaBackLink: { href: "/cv#media", label: "Back to Curriculum Vitae" },
	cvPublicationBackLink: { href: "/cv#publications", label: "Back to Curriculum Vitae" },
	academicSpotlight: {
		badge: "📄 Peer-Reviewed Academic Publication",
		dateLabel: "Date:",
		rolesLabel: "Roles:",
		abstractTitle: "Publication Abstract",
		introTemplate:
			"This academic research publication is directly connected to the {title} technical case study documented below. Explore the formal publication records, citations, and official PDF repository below:",
		doiLabel: "View Official DOI",
		pdfLabel: "Download Official PDF",
		archiveLabel: "Archive / Repository",
		allPublicationsLabel: "← View all publications in CV"
	},
	mediaSpotlight: {
		badge: "📰 Press & Media Spotlight",
		publishedLabel: "Published:",
		featuredInPrefix: "Featured in",
		introTemplate:
			"This media coverage spotlights the technical art, visual fidelity, and research of the {title} project. Read the original article, watch video features, or listen to the podcast below:",
		articleLabel: "Read Original Article",
		videoLabel: "Watch Video Coverage",
		podcastLabel: "Listen to Podcast"
	},
	metadata: {
		roleHeading: "Role & Leadership",
		clientPrefix: "Client:",
		yearPrefix: "Year:",
		platformHeading: "Target Platforms",
		techHeading: "Software & Tech Stack",
		linksHeading: "Project Links",
		liveDemoLabel: "Live Project Page",
		githubLabel: "GitHub",
		videoLabel: "Watch Video",
		fallbackLabel: "Research & Production",
		techTooltipTemplate: "Learn more about {tech} (official website)"
	},
	publicationsSection: {
		title: "Academic Publications",
		subtitle: "Peer-reviewed symposium and journal publications covering this work",
		rolesLabel: "Roles:",
		abstractLabel: "Abstract Preview",
		doiLabel: "DOI Citation",
		pdfLabel: "Official PDF",
		caseStudyLabel: "View Abstract and Project Details"
	},
	mediaSection: {
		title: "Press & Media Recognition",
		subtitle: "Articles, video features, and media coverage celebrating this project",
		readArticleLabel: "Read Article",
		watchVideoLabel: "Watch Video",
		podcastLabel: "Podcast",
		spotlightLabel: "View Project Details"
	},
	tocHeading: "Contents",
	prevProjectLabel: "Previous Project",
	nextProjectLabel: "Next Project"
} as const;

export const PROJECT_CARD_TEXT = {
	liveDemoTitle: "Live Demo Available",
	githubTitle: "GitHub Repository Available",
	videoTitle: "Gameplay Video Available",
	ctaLabel: "View Project Details"
} as const;

export const PROJECT_COMPONENTS_TEXT = {
	highlightDefaultBadge: "Project Highlight",
	highlightDefaultLinkText: "Learn More",
	imageEmbedFullscreenTitle: "View image fullscreen",
	lightboxFullscreenTitle: "Enter fullscreen",
	lightboxCloseTitle: "Close (Esc)",
	imageSliderDefaultBefore: "Before",
	imageSliderDefaultAfter: "After",
	videoDefaultTitle: "Embedded video",
	codeCopyLabel: "Copy",
	codeCopiedLabel: "Copied!",
	codeCopyTitle: "Copy code to clipboard",
	codeShowMoreLabel: "Show More",
	codeShowLessLabel: "Show Less"
} as const;
