import { defineContentConfig, defineCollection, z } from '@nuxt/content'

// Content directory relative to project root
const contentDir = 'app/content'

export default defineContentConfig({
  collections: {
    pages: defineCollection({
      type: 'page',
      source: {
        include: '*.{md,mdx}',
        cwd: contentDir
      },
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        icon: z.string().optional(),
        publishedAt: z.string().optional(),
        // Homepage specific fields
        handle: z.string().optional(),
        isHirable: z.boolean().optional(),
        email: z.string().optional(),
        calendarLink: z.string().optional(),
        bio: z.array(z.string()).optional(),
        socials: z.object({
          github: z.string().optional(),
          linkedin: z.string().optional(),
          twitter: z.string().optional(),
        }).optional(),
      }),
    }),
    blog: defineCollection({
      type: 'page',
      source: {
        include: 'blogs/**/*.{md,mdx}',
        cwd: contentDir
      },
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        publishedAt: z.string().optional(),
        tags: z.array(z.string()).optional(),
        banner: z.boolean().optional(),
        bannerImage: z.string().optional(),
      }),
    }),
    projects: defineCollection({
      type: 'page',
      source: {
        include: 'projects/**/*.{md,mdx}',
        cwd: contentDir
      },
      schema: z.object({
        title: z.string(),
        description: z.string(),
        image: z.string().optional(),
        tags: z.array(z.string()).optional(),
        github: z.string().optional(),
        live: z.string().optional(),
        featured: z.boolean().optional(),
        date: z.string().optional(),
      }),
    }),
    skills: defineCollection({
      type: 'page',
      source: {
        include: 'skills/**/*.{md,mdx}',
        cwd: contentDir
      },
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        category: z.string().optional(),
        level: z.string().optional(),
      }),
    }),
    stacks: defineCollection({
      type: 'page',
      source: {
        include: 'stacks/**/*.{md,mdx}',
        cwd: contentDir
      },
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        category: z.string().optional(),
      }),
    }),
    experiences: defineCollection({
      type: 'page',
      source: {
        include: 'experiences/**/*.{md,mdx}',
        cwd: contentDir
      },
      schema: z.object({
        title: z.string(),
        company: z.string(),
        location: z.string().optional(),
        type: z.enum(['full-time', 'part-time', 'freelance', 'internship', 'contract']).optional(),
        startDate: z.string(),
        endDate: z.string().optional(),
        current: z.boolean().optional(),
        description: z.string(),
        technologies: z.array(z.string()).optional(),
        logo: z.string().optional(),
      }),
    }),
  }
})
