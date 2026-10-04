import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Header fields every content page shares, laid out like the top of a score:
// title centred, a tempo-style marking on the left, an attribution on the right.
const heading = {
  title: z.string(),
  subtitle: z.string().optional(),
  marking: z.string().optional(),
  attribution: z.string().optional(),
};

const link = z.object({
  label: z.string(),
  href: z.string(),
  download: z.boolean().default(false),
});

// A two-page spread: text on the left page, a plate (score, portrait, figure) on the right.
const sections = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/sections' }),
  schema: ({ image }) =>
    z.object({
      ...heading,
      links: z.array(link).default([]),
      plate: z
        .object({
          image: image(),
          alt: z.string(),
          caption: z.string().optional(),
          kind: z.enum(['score', 'portrait', 'figure']).default('score'),
        })
        .optional(),
    }),
});

// Entries in the "Works" catalogue spread.
const works = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/works' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    role: z.string().optional(),
    year: z.number().optional(),
    href: z.string(),
    linkLabel: z.string().optional(),
  }),
});

// One spread per YouTube recording: video and notes on the left, lead sheet on the right.
const recordings = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/recordings' }),
  schema: ({ image }) =>
    z.object({
      ...heading,
      order: z.number(),
      youtubeId: z.string().regex(/^[\w-]{11}$/, 'Expected the 11-character YouTube video id'),
      aspect: z.enum(['16/9', '4/3', '1/1']).default('16/9'),
      leadSheet: image().optional(),
    }),
});

export const collections = { sections, works, recordings };
