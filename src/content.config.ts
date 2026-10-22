import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const projectCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    tagline: z.string(),
    thumbnail: z.string().optional(),
    role: z.string(),
    priority: z.number().default(99),
    year: z.number(),
    filters: z.array(z.string()).optional(),
    tech: z.array(z.string()),
    status: z.enum(["Released", "In Development", "Ongoing"]).optional(),
    client: z.string().optional(),
    platform: z.array(z.string()),
    liveUrl: z.string().url().or(z.literal("")).optional(),
    githubUrl: z.string().url().or(z.literal("")).optional(),
    videoUrl: z.string().url().or(z.literal("")).optional(),
  }),
});

export const collections = {
  projects: projectCollection,
};
