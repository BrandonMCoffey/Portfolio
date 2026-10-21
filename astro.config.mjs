// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import rehypeExternalLinks from 'rehype-external-links';

export default defineConfig({
    site: 'https://brandoncoffey.com',
    integrations: [
        react(),
        sitemap(),
        mdx(),
    ],
    markdown: {
        processor: unified({
            rehypePlugins: [
                [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
            ],
        }),
    },
    vite: {
        plugins: [tailwindcss()],
    },
});
