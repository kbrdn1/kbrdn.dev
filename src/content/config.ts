import { z, defineCollection } from 'astro:content'

import { blogShema } from '@app/model'
import { stackShema } from '@app/model'
import { projectsShema } from '@app/model'

const blogCollection = defineCollection({
  schema: blogShema,
})

const stackCollection = defineCollection({
  schema: stackShema,
})

const projectsCollection = defineCollection({
  schema: projectsShema,
})

export const collections = {
  blog: blogCollection,
  stack: stackCollection,
  projects: projectsCollection,
}
