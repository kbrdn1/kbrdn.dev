import { z } from 'astro:content'

export const footerSchema = z.object({
  build: z.string(),
  hosted: z.string(),
})
export type footerSchema = z.infer<typeof footerSchema>

export const navSchema = z.object({
  me: z.object({
    job: z.string(),
    spec: z.string(),
  }),
  subtitle: z.object({
    resources: z.string(),
    social: z.string(),
  }),
  links: z.object({
    explore: z.string(),
    projects: z.string(),
    blog: z.string(),
    hire: z.string(),
    skills: z.string(),
    stack: z.string(),
    now: z.string(),
    cv: z.string(),
  }),
})
export type navSchema = z.infer<typeof navSchema>
