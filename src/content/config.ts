import { z, defineCollection } from 'astro:content';

import { footerSchema } from '../model';
import { navSchema } from '../model';

const footerCollection = defineCollection({
  schema: footerSchema,
});

const navCollection = defineCollection({
  schema: navSchema,
});

export const collections = {
  'footer': footerCollection,
  'nav': navCollection,
};