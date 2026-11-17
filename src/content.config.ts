import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { DEFAULT_PROJECT_PRIORITY } from "./consts";

const projectSchema = z.object({
  title: z.string(),
  tagline: z.string(),
  thumbnail: z.string().optional(),
  role: z.string(),
  priority: z.number().default(DEFAULT_PROJECT_PRIORITY),
  year: z.number(),
  filters: z.array(z.string()).optional(),
  tech: z.array(z.string()),
  status: z.enum(["Released", "In Development", "Ongoing", "Hidden"]).optional(),
  client: z.string().optional(),
  platform: z.array(z.string()),
  liveUrl: z.string().url().or(z.literal("")).optional(),
  githubUrl: z.string().url().or(z.literal("")).optional(),
  videoUrl: z.string().url().or(z.literal("")).optional(),
});

const projectCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
  schema: projectSchema,
});

const projectsHiddenCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects-hidden" }),
  schema: projectSchema,
});

const experienceCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/experience" }),
  schema: z.object({
    order: z.number(),
    role: z.string(),
    company: z.string(),
    labBadge: z.string().optional(),
    time: z.string(),
    location: z.string(),
    takeaways: z.array(z.string()),
    awards: z.array(z.string()).optional(),
    filterLink: z.string(),
    filterText: z.string(),
  }),
});

const ctaSchema = z.object({
  label: z.string(),
  href: z.string().optional(),
  type: z.enum(["email", "linkedin", "github"]).optional(),
  variant: z.enum(["primary", "secondary"]).default("secondary"),
  emphasize: z.boolean().optional(),
});

const sectionsCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/sections" }),
  schema: z.discriminatedUnion("section", [
    z.object({
      section: z.literal("hero"),
      headlinePrefix: z.string(),
      headlineHighlight: z.string(),
      headlineSuffix: z.string(),
      ctas: z.array(ctaSchema),
      toolkitLabel: z.string(),
      toolkit: z.array(z.string()),
      connectLabel: z.string(),
    }),
    z.object({
      section: z.literal("projects-showcase"),
      title: z.string(),
      ctaLabelTemplate: z.string(),
      ctaHref: z.string(),
    }),
    z.object({
      section: z.literal("experience-intro"),
      title: z.string(),
    }),
    z.object({
      section: z.literal("about"),
      title: z.string(),
      bioHeading: z.string(),
      ctas: z.array(ctaSchema),
      skillCategories: z.array(
        z.object({
          title: z.string(),
          icon: z.string(),
          skills: z.array(z.string()),
        }),
      ),
    }),
    z.object({
      section: z.literal("contact"),
      title: z.string(),
      ctaLabel: z.string(),
    }),
    z.object({
      section: z.literal("projects-archive"),
      metaTitlePrefix: z.string(),
      metaDescriptionTemplate: z.string(),
      badgeLabel: z.string(),
      badgeCountTemplate: z.string(),
      title: z.string(),
      searchPlaceholder: z.string(),
      clearSearchAriaLabel: z.string(),
      sortLabel: z.string(),
      categoryLabel: z.string(),
      techLabel: z.string(),
      showingPrefix: z.string(),
      showingMiddle: z.string(),
      showingSuffix: z.string(),
      resetLabel: z.string(),
      emptyEmoji: z.string(),
      emptyTitle: z.string(),
      emptyDescription: z.string(),
      emptyCtaLabel: z.string(),
    }),
    z.object({
      section: z.literal("cv-page"),
      metaTitlePrefix: z.string(),
      metaDescriptionTemplate: z.string(),
      breadcrumbHome: z.string(),
      breadcrumbCurrent: z.string(),
      printButtonLabel: z.string(),
      eyebrow: z.string(),
      metrics: z.object({
        publications: z.object({
          label: z.string(),
          summary: z.string(),
          title: z.string(),
        }),
        awards: z.object({
          label: z.string(),
          summaryTemplate: z.string(),
          title: z.string(),
        }),
        media: z.object({
          label: z.string(),
          summary: z.string(),
          title: z.string(),
        }),
        exhibitions: z.object({
          label: z.string(),
          summary: z.string(),
          title: z.string(),
        }),
      }),
      sections: z.object({
        education: z.object({
          title: z.string(),
          subtitle: z.string(),
        }),
        publications: z.object({
          title: z.string(),
          subtitleTemplate: z.string(),
          allFilterLabel: z.string(),
          rolesPrefix: z.string(),
          doiPrefix: z.string(),
          officialPdfLabel: z.string(),
          archiveLabel: z.string(),
          caseStudyLabel: z.string(),
          resetButtonLabel: z.string(),
        }),
        grants: z.object({
          title: z.string(),
          subtitleTemplate: z.string(),
          cyclePrefix: z.string(),
          durationPrefix: z.string(),
        }),
        awards: z.object({
          title: z.string(),
          subtitleTemplate: z.string(),
          projectPrefix: z.string(),
          galleryLabel: z.string(),
          institutionalFallback: z.string(),
          caseStudyLabel: z.string(),
        }),
        media: z.object({
          title: z.string(),
          subtitleTemplate: z.string(),
          readArticleLabel: z.string(),
          watchVideoLabel: z.string(),
          listenPodcastLabel: z.string(),
          spotlightLabel: z.string(),
        }),
        exhibitions: z.object({
          title: z.string(),
          subtitleTemplate: z.string(),
          featuredWorkPrefix: z.string(),
        }),
        tours: z.object({
          title: z.string(),
          subtitleTemplate: z.string(),
        }),
        teaching: z.object({
          title: z.string(),
          subtitle: z.string(),
        }),
      }),
    }),
  ]),
});

export const collections = {
  projects: projectCollection,
  projectsHidden: projectsHiddenCollection,
  experience: experienceCollection,
  sections: sectionsCollection,
};
